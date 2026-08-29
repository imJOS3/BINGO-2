import { Sequelize } from 'sequelize';
import net from 'node:net';
import { Resolver } from 'node:dns/promises';
import dotenv from 'dotenv';

dotenv.config();

const sslMode = (process.env.DB_SSL_MODE || '').toUpperCase();
const useSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  sslMode === 'REQUIRED' ||
  sslMode === 'VERIFY_CA' ||
  sslMode === 'VERIFY_IDENTITY';

const dbHost = (process.env.DB_HOST || '').trim();

const resolveDbHost = async (host) => {
  if (!host || net.isIP(host)) return host;

  const resolver = new Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1']);

  try {
    const [ip] = await resolver.resolve4(host);
    console.log(`MySQL host ${host} → ${ip}`);
    return ip;
  } catch (error) {
    console.warn(`No se pudo resolver ${host}: ${error.message}`);
    return host;
  }
};

const resolvedHost = await resolveDbHost(dbHost);

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: resolvedHost,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 20000,
      ...(useSsl
        ? {
            ssl: {
              require: true,
              // Aiven free: suficiente para conectar. Con CA local podrías poner true.
              rejectUnauthorized: false,
              servername: dbHost,
            },
          }
        : {}),
    },
  }
);

export default db;
