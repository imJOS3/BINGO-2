import express from 'express';
import http from 'http'; 
import { Server as SocketIOServer } from 'socket.io'; 
import db from './database/db.js';
import bingoRoutes from './routes/bingoRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os'; 



const app = express();
// Crear un servidor HTTP para usar con Socket.IO
dotenv.config();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ['*', 'http://localhost:5173'], // Permitir todas las solicitudes desde cualquier origen
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

// Función para obtener la dirección IP local
const getLocalIp = () => {
  const networkInterfaces = os.networkInterfaces();
  for (let interfaceName in networkInterfaces) {
    for (let interfaceDetails of networkInterfaces[interfaceName]) {
      // Si es una dirección IPv4, devolvemos la dirección IP
      if (interfaceDetails.family === 'IPv4' && !interfaceDetails.internal) {
        return interfaceDetails.address;
      }
    }
  }
  return 'localhost'; // Si no se puede obtener, devolvemos localhost como valor predeterminado
};

// Obtener la IP local
const localIp = getLocalIp();

// Iniciar el servidor y sincronizar la base de datos
server.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://${localIp}:${PORT}`);
  console.log(`Accede a tu servidor en la red local con: http://${localIp}:${PORT}`);
  console.log(`Accede a tu servidor desde fuera de la red local con: http://<tu-ip-publica>:${PORT}`);
  await db.sync(); // Sincroniza los modelos con la base de datos
});
