import express from 'express';
import http from 'http'; // Importa http para usarlo con Socket.IO
import { Server as SocketIOServer } from 'socket.io'; // Importa la clase Server de Socket.IO
import db from './database/db.js';
import bingoRoutes from './routes/bingoRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
// Crear un servidor HTTP para usar con Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Permitir todas las solicitudes desde cualquier origen
  },
});

// Configuración básica de CORS
app.use(cors());

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Configuración para manejar JSON
app.use(express.json());

// Ruta base
app.use('/api', bingoRoutes);

app.get('/', (req, res) => {
  res.send("solicitud post");
});

// Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Escuchar el evento de mensaje entrante
  socket.on('chat message', (msg) => {
    console.log('Mensaje recibido:', msg);
    // Emitir el mensaje a todos los clientes conectados
    io.emit('chat message', msg);
  });

  // Evento de desconexión
  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

// Iniciar el servidor y sincronizar la base de datos
server.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  await db.sync(); // Sincroniza los modelos con la base de datos
});
