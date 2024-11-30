import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import GameMode from './GameMode.js';

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
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,  
    },
    game_mode_id: {
        type: DataTypes.INTEGER,
        allowNull: true,  
    },
    game_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3, // Tiempo predeterminado de 3 minutos
        validate: {
            min: 3, // Valor mínimo permitido
            max: 6, // Valor máximo permitido
        },
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

Game.belongsTo(GameMode, { foreignKey: 'game_mode_id' });

// Exporta el modelo
export default Game;
