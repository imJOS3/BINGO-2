-- Añade visibilidad público/privado a las partidas
-- Si la columna ya existe, ignora el error "Duplicate column"

ALTER TABLE games
  ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 1;
