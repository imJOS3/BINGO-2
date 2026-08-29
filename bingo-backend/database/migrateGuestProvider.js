import db from './db.js';

const run = async () => {
  try {
    await db.authenticate();
    await db.query('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
    await db.query(
      "ALTER TABLE users MODIFY COLUMN provider ENUM('local','google','facebook','guest') NOT NULL DEFAULT 'local'"
    );
    console.log('OK: provider ENUM incluye guest');
    process.exit(0);
  } catch (error) {
    console.error('FAIL:', error.message);
    process.exit(1);
  }
};

run();
