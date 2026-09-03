import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import db from './database/db.js';
import './model/Users.js';
import './model/GameMode.js';
import './model/games.js';
import './model/bingoCards.js';
import './model/UserGames.js';
import './model/calledNumber.js';
import bingoRoutes from './routes/bingoRoutes.js';
import { seedGameModes } from './database/seedGameModes.js';
import { cleanupDuplicates } from './database/cleanupDuplicates.js';
import { generateRoomCode } from './utils/roomCode.js';
import { setIO } from './socket.js';
import {
  joinPresence,
  leavePresence,
  setAway,
  scheduleStartupSweep,
} from './services/presence.js';
import { resumeActiveCallers } from './services/ballCaller.js';
import { resumeTimeUps } from './services/roundTimer.js';
import { closeAbandonedGames } from './services/playerRoster.js';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';
import openapiSpec from './docs/openapi.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('ADVERTENCIA: JWT_SECRET no está definido en .env');
}

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://www.bingonline.fun',
  'https://bingonline.fun',
  'https://bingo-2-ten.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const clean = origin.replace(/\/$/, "");
    callback(null, allowedOrigins.includes(clean));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ["websocket", "polling"],
  pingInterval: 10000,
  pingTimeout: 8000,
});
setIO(io);

app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/openapi.json', (_req, res) => {
  res.json(openapiSpec);
});
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'Bingonline API',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use('/api', bingoRoutes);

app.get('/', (req, res) => {
  res.send('¡Servidor funcionando! Documentación: /api/docs');
});

const chatHistoryByGame = new Map();

const rememberChat = (gameId, msg) => {
  if (!gameId) return;
  const key = String(gameId);
  const list = chatHistoryByGame.get(key) || [];
  list.push(msg);
  chatHistoryByGame.set(key, list.slice(-100));
};

io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  socket.on('joinGameChat', (gameId) => {
    if (!gameId) return;
    const room = `game:${gameId}`;
    socket.join(room);
    socket.emit('chatHistory', chatHistoryByGame.get(String(gameId)) || []);
  });

  socket.on('presenceJoin', (payload) => {
    joinPresence(socket, payload || {});
  });

  socket.on('presenceAway', () => setAway(socket, true));
  socket.on('presenceBack', () => setAway(socket, false));

  socket.on('chatMessage', (payload) => {
    const data = typeof payload === 'string' ? { message: payload } : payload || {};
    const text = typeof data.message === 'string' ? data.message.trim() : '';
    if (!text) return;

    const enriched = {
      id: `${socket.id}-${Date.now()}`,
      socketId: socket.id,
      message: text.slice(0, 500),
      nickname: (data.nickname && String(data.nickname).slice(0, 20)) || 'Jugador',
      userId: data.userId ?? null,
      isHost: Boolean(data.isHost),
      gameId: data.gameId ?? null,
      createdAt: data.createdAt || new Date().toISOString(),
    };

    rememberChat(enriched.gameId, enriched);

    const room = data.gameId ? `game:${data.gameId}` : null;
    if (room) {
      io.to(room).emit('chatMessage', enriched);
    } else {
      io.emit('chatMessage', enriched);
    }
  });

  socket.on('disconnect', () => {
    leavePresence(socket);
  });
});

const PORT = process.env.PORT || 3000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const authenticateWithRetry = async (attempts = 5) => {
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      await db.authenticate();
      console.log('Conexión a la base de datos establecida con éxito.');
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Intento ${i}/${attempts} de conexión falló: ${error.message}`);
      if (i < attempts) await sleep(2000 * i);
    }
  }
  throw lastError;
};

const ensureGameColumns = async () => {
  try {
    await db.query(
      'ALTER TABLE games ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 1'
    );
    console.log('Columna games.is_public añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna is_public:', columnError.message);
    }
  }

  try {
    await db.query('ALTER TABLE games ADD COLUMN win_pattern JSON NULL');
    console.log('Columna games.win_pattern añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna win_pattern:', columnError.message);
    }
  }

  try {
    await db.query('ALTER TABLE games ADD COLUMN room_code VARCHAR(6) NULL');
    console.log('Columna games.room_code añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna room_code:', columnError.message);
    }
  }

  try {
    const [missing] = await db.query(
      "SELECT id FROM games WHERE room_code IS NULL OR room_code = ''"
    );
    for (const row of missing) {
      for (let attempt = 0; attempt < 16; attempt++) {
        const code = generateRoomCode();
        try {
          await db.query('UPDATE games SET room_code = ? WHERE id = ?', {
            replacements: [code, row.id],
          });
          break;
        } catch (updateError) {
          if (!/Duplicate/i.test(updateError.message || '')) throw updateError;
        }
      }
    }
  } catch (backfillError) {
    console.warn('Aviso códigos de mesa:', backfillError.message);
  }

  try {
    await db.query(
      'CREATE UNIQUE INDEX games_room_code_unique ON games (room_code)'
    );
  } catch (indexError) {
    const msg = indexError.message || '';
    if (!msg.includes('Duplicate') && indexError.original?.code !== 'ER_DUP_KEYNAME') {
      console.warn('Aviso índice room_code:', indexError.message);
    }
  }

  try {
    await db.query('ALTER TABLE games ADD COLUMN join_key VARCHAR(20) NULL');
    console.log('Columna games.join_key añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna join_key:', columnError.message);
    }
  }
};

const ensureUserGameColumns = async () => {
  try {
    await db.query(
      'ALTER TABLE user_games ADD COLUMN is_spectator TINYINT(1) NOT NULL DEFAULT 0'
    );
    console.log('Columna user_games.is_spectator añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna is_spectator:', columnError.message);
    }
  }

  try {
    await db.query('ALTER TABLE user_games ADD COLUMN eliminated_at DATETIME NULL');
    console.log('Columna user_games.eliminated_at añadida');
  } catch (columnError) {
    const msg = columnError.message || '';
    if (!msg.includes('Duplicate') && columnError.original?.code !== 'ER_DUP_FIELDNAME') {
      console.warn('Aviso columna eliminated_at:', columnError.message);
    }
  }
};

const initDatabase = async () => {
  await authenticateWithRetry();

  try {
    await cleanupDuplicates(db);
  } catch (cleanupError) {
    console.warn('Aviso limpieza duplicados:', cleanupError.message);
  }

  // alter:true es lento y a veces falla con FKs/índices ya existentes.
  // Actívalo solo con DB_SYNC_ALTER=true cuando cambies modelos.
  if (process.env.DB_SYNC_ALTER === 'true') {
    try {
      await db.sync({ alter: true });
    } catch (syncError) {
      console.warn('sync alter avisó:', syncError.message);
      await db.sync();
    }
  } else {
    await db.sync();
  }

  await ensureGameColumns();
  await ensureUserGameColumns();
  await seedGameModes();
  await resumeActiveCallers();
  await resumeTimeUps();
  await closeAbandonedGames();
  await scheduleStartupSweep();
};

const retryDatabaseInBackground = async () => {
  let delay = 8000;
  while (true) {
    await sleep(delay);
    try {
      await initDatabase();
      return;
    } catch (error) {
      console.error(
        `MySQL sigue inaccesible (${error.message}). Reintento en ${Math.round(delay / 1000)}s...`
      );
      delay = Math.min(Math.round(delay * 1.4), 30000);
    }
  }
};

const start = async () => {
  // Socket.IO vive en este HTTP server: hay que escuchar aunque MySQL falle,
  // si no el frontend recibe ERR_CONNECTION_REFUSED en /socket.io/.
  server.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
  });

  try {
    await initDatabase();
  } catch (error) {
    console.error('Error al iniciar la base de datos:', error.message);
    console.error(
      'HTTP y Socket.IO siguen activos. Revisa Aiven (servicio encendido, host/puerto actuales) o usa MySQL local.'
    );
    retryDatabaseInBackground();
  }
};

start();
