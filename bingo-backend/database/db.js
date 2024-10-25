import { Sequelize } from 'sequelize';

const db = new Sequelize('bingo_online', 'root', 'tuclave', {
    host: 'localhost', 
    port: 3306, 
    dialect: 'mysql',
});

try {
    await db.authenticate();
    console.log('Conexión a la base de datos establecida con éxito.');
} catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
}

export default db;
