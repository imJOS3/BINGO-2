import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Instanciar Sequelize sin usar funciones asíncronas
const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  }
);

const testConnection = async () => {
  try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
};

testConnection();

export default db;
