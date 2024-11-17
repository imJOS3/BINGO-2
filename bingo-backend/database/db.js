import { Sequelize } from 'sequelize';

const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
});

try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
} catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
}   

export default db;
