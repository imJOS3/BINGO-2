import express from 'express';
import db from './database/db.js';
import bingoRoutes from './routes/bingoRoutes.js'
import cors from 'cors'
import dotenv from 'dotenv';




const app = express();
dotenv.config()
// Configuración básica de CORS, permite todas las peticiones desde cualquier origen
app.use(cors());

//puerto donde se ejecuta
const PORT = process.env.PORT || 3000;

//req, body
app.use(express.json());

//ruta 
app.use('/api', bingoRoutes);

app.get('/', (req, res) => {
    res.send("solicitud post")
})

//listen
app.listen(PORT, async () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    await db.sync(); // Sincroniza los modelos con la base de datos
});
