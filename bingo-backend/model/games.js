import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import GameMode from './GameMode.js';
import User from './Users.js';

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
    room_code: {
        type: DataTypes.STRING(6),
        allowNull: true,
        unique: true,
    },
    game_status: {
        type: DataTypes.ENUM('active', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'active',
    },
    user_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    creator_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    game_mode_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'game_modes',
            key: 'id',
        },
    },
    game_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 3,
        validate: {
            min: 3,
            max: 6,
        },
    },
    is_public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    join_key: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
    win_pattern: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    ended_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    winner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    winner_nickname: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },
}, {
    tableName: 'games',
    timestamps: false,
});

Game.belongsTo(GameMode, { foreignKey: 'game_mode_id' });
GameMode.hasMany(Game, { foreignKey: 'game_mode_id' });

Game.belongsTo(User, { as: 'creator', foreignKey: 'creator_id' });
Game.belongsTo(User, { as: 'winner', foreignKey: 'winner_id' });

export default Game;
