-- Migración: OAuth + invitados
-- Si la tabla users ya existe, ejecuta esto (o usa: npm run db:sync)

ALTER TABLE users
  MODIFY COLUMN password VARCHAR(255) NULL;

ALTER TABLE users
  MODIFY COLUMN provider ENUM('local', 'google', 'facebook', 'guest') NOT NULL DEFAULT 'local';
