// models/GameMode.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const GameMode = db.define('GameMode', {
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'game_modes',
  timestamps: false, 
});

export default GameMode;
