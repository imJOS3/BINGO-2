-- Clave de entrada para mesas privadas
ALTER TABLE games
  ADD COLUMN join_key VARCHAR(20) NULL;
