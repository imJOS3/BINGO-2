import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const Game = db.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    game_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    game_status: {
        type: DataTypes.ENUM('active', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'active',
    },
    user_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'games',
    timestamps: false,
});

// Exporta el modelo
export default Game;

