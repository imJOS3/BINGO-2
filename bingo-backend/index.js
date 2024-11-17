import express from 'express';
import db from './database/db.js';
import bingoRoutes from './routes/bingoRoutes.js';
import cors from 'cors';
import dotenv from 'dotenv';
import os from 'os'; // Módulo para obtener la dirección IP local

const app = express();
dotenv.config();

// Configuración básica de CORS, permite todas las peticiones desde cualquier origen
app.use(cors());

// Puerto donde se ejecuta
const PORT = process.env.PORT || 3000;

// req, body
app.use(express.json());

// Ruta
app.use('/api', bingoRoutes);

app.get('/', (req, res) => {
    res.send("solicitud post");
});

// Obtener la dirección IP local
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

// Obtener la IP y el puerto
const localIp = getLocalIp();

// Mostrar mensaje de inicio con la dirección IP y el puerto
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://${localIp}:${PORT}`);
    console.log(`Accede a tu servidor en la red local con: http://${localIp}:${PORT}`);
    console.log(`Accede a tu servidor desde fuera de la red local con: http://<tu-ip-publica>:${PORT}`);
    await db.sync(); // Sincroniza los modelos con la base de datos
});
