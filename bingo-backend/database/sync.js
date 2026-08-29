/**
 * Crea las tablas en MySQL según los modelos Sequelize.
 * Uso: node database/sync.js
 *
 * Requiere .env con:
 * DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
 * (opcional) DB_SSL=true  → necesario en Aiven y la mayoría de nubes
 */
import db from './db.js';
import '../model/Users.js';
import '../model/GameMode.js';
import '../model/games.js';
import '../model/bingoCards.js';
import '../model/UserGames.js';
import '../model/calledNumber.js';
import { seedGameModes } from './seedGameModes.js';
import { cleanupDuplicates } from './cleanupDuplicates.js';

const run = async () => {
  try {
    await db.authenticate();
    console.log('Conexión OK');

    try {
      await cleanupDuplicates(db);
    } catch (cleanupError) {
      console.warn('Aviso limpieza duplicados:', cleanupError.message);
    }

    await db.sync({ alter: true });
    console.log('Tablas creadas/actualizadas');

    await seedGameModes();
    console.log('Listo');
    process.exit(0);
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
    process.exit(1);
  }
};

run();
