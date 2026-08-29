/**
 * Limpia filas duplicadas antes de aplicar índices UNIQUE.
 * Evita que db.sync({ alter: true }) falle con "Validation error".
 */
export const cleanupDuplicates = async (db) => {
  // Nicknames duplicados → nickname_id
  await db.query(`
    UPDATE users u
    JOIN (
      SELECT nickname, MIN(id) AS keep_id
      FROM users
      GROUP BY nickname
      HAVING COUNT(*) > 1
    ) d ON u.nickname = d.nickname AND u.id <> d.keep_id
    SET u.nickname = CONCAT(LEFT(u.nickname, 12), '_', u.id)
  `);

  // user_games duplicados (mismo user + game) → deja el de menor id
  await db.query(`
    DELETE ug FROM user_games ug
    INNER JOIN user_games ug2
      ON ug.user_id = ug2.user_id
      AND ug.game_id = ug2.game_id
      AND ug.id > ug2.id
  `);

  // Números llamados duplicados
  await db.query(`
    DELETE cn FROM called_numbers cn
    INNER JOIN called_numbers cn2
      ON cn.game_id = cn2.game_id
      AND cn.number_called = cn2.number_called
      AND cn.id > cn2.id
  `);

  // Cartones duplicados (mismo user + game)
  await db.query(`
    DELETE bc FROM bingo_cards bc
    INNER JOIN bingo_cards bc2
      ON bc.user_id = bc2.user_id
      AND bc.game_id = bc2.game_id
      AND bc.id > bc2.id
  `);

  // Filas huérfanas que rompen FKs
  await db.query(`
    DELETE FROM called_numbers
    WHERE game_id NOT IN (SELECT id FROM games)
  `);
  await db.query(`
    DELETE FROM bingo_cards
    WHERE game_id NOT IN (SELECT id FROM games)
       OR user_id NOT IN (SELECT id FROM users)
  `);
  await db.query(`
    DELETE FROM user_games
    WHERE game_id NOT IN (SELECT id FROM games)
       OR user_id NOT IN (SELECT id FROM users)
  `);

  // Recalcular user_count desde user_games
  await db.query(`
    UPDATE games g
    SET user_count = (
      SELECT COUNT(*) FROM user_games ug WHERE ug.game_id = g.id
    )
  `);

  console.log('Limpieza de duplicados completada');
};
