-- Schema MySQL según los modelos Sequelize del bingo
-- Ejecuta esto en Aiven / Railway / cualquier MySQL en la nube

CREATE DATABASE IF NOT EXISTS bingo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bingo;

-- 1. Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NULL,
  nickname VARCHAR(20) NOT NULL,
  provider ENUM('local', 'google', 'facebook', 'guest') NOT NULL DEFAULT 'local',
  provider_id VARCHAR(255) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email),
  UNIQUE KEY users_nickname_unique (nickname),
  UNIQUE KEY users_provider_provider_id_unique (provider, provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Modos de juego
CREATE TABLE IF NOT EXISTS game_modes (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Partidas
CREATE TABLE IF NOT EXISTS games (
  id INT NOT NULL AUTO_INCREMENT,
  game_name VARCHAR(255) NOT NULL,
  room_code CHAR(6) NULL,
  game_status ENUM('active', 'in_progress', 'completed') NOT NULL DEFAULT 'active',
  user_count INT NOT NULL DEFAULT 0,
  creator_id INT NOT NULL,
  game_mode_id INT NULL,
  game_time INT NOT NULL DEFAULT 3,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  join_key VARCHAR(20) NULL,
  win_pattern JSON NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME NULL,
  ended_at DATETIME NULL,
  winner_id INT NULL,
  winner_nickname VARCHAR(20) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY games_room_code_unique (room_code),
  CONSTRAINT fk_games_game_mode
    FOREIGN KEY (game_mode_id) REFERENCES game_modes(id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_games_creator
    FOREIGN KEY (creator_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_games_winner
    FOREIGN KEY (winner_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Cartones de bingo
CREATE TABLE IF NOT EXISTS bingo_cards (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  numbers JSON NOT NULL,
  marked_numbers JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY bingo_cards_user_game_unique (user_id, game_id),
  CONSTRAINT fk_bingo_cards_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_bingo_cards_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Relación usuarios ↔ partidas (un usuario solo una vez por partida)
CREATE TABLE IF NOT EXISTS user_games (
  id INT NOT NULL AUTO_INCREMENT,
  user_id INT NOT NULL,
  game_id INT NOT NULL,
  is_spectator TINYINT(1) NOT NULL DEFAULT 0,
  eliminated_at DATETIME NULL,
  bingo_card_id INT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY user_games_user_game_unique (user_id, game_id),
  CONSTRAINT fk_user_games_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_user_games_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_user_games_bingo_card
    FOREIGN KEY (bingo_card_id) REFERENCES bingo_cards(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Números llamados por partida (sin números duplicados)
CREATE TABLE IF NOT EXISTS called_numbers (
  id INT NOT NULL AUTO_INCREMENT,
  game_id INT NOT NULL,
  number_called INT NOT NULL,
  called_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY called_numbers_game_number_unique (game_id, number_called),
  CONSTRAINT fk_called_numbers_game
    FOREIGN KEY (game_id) REFERENCES games(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos iniciales de modos de juego (ids alineados con el frontend)
INSERT INTO game_modes (id, name, description) VALUES
  (1, 'Full Card', 'Llena toda la cartilla para ganar'),
  (2, 'Right Diagonal', 'Completa la diagonal derecha'),
  (3, 'Left Diagonal', 'Completa la diagonal izquierda'),
  (4, 'Column B', 'Completa la columna B'),
  (5, 'Column I', 'Completa la columna I'),
  (6, 'Column N', 'Completa la columna N'),
  (7, 'Column G', 'Completa la columna G'),
  (8, 'Column O', 'Completa la columna O'),
  (9, 'Custom', 'Modo personalizado')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);
