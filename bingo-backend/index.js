import express from 'express';
import http from 'http'; 
import { Server as SocketIOServer } from 'socket.io'; 
import db from './database/db.js';
import bingoRoutes from './routes/bingoRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os'; 

dotenv.config();
const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: "*", // Asegúrate de usar la URL correcta del frontend.
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', bingoRoutes);

app.get('/', (req, res) => {
  res.send("¡Servidor funcionando!");
});

// Evento de conexión
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  // Escuchar mensajes del chat
  socket.on('chatMessage', (msg) => {
    console.log(`Mensaje recibido de ${socket.id}: ${msg}`);

    // Emitir el mensaje a todos los clientes conectados
    io.emit('chatMessage', { id: socket.id, message: msg });
  });

  // Manejar desconexión
  socket.on('disconnect', () => {
    console.log(`Usuario desconectado: ${socket.id}`);
  });
});


const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  await db.sync();
});
