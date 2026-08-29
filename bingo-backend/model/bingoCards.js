import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import User from './Users.js';
import Game from './games.js';

const BingoCards = db.define('bingoCards', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'games',
            key: 'id',
        },
    },
    numbers: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    marked_numbers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'bingo_cards',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'game_id'],
            name: 'bingo_cards_user_game_unique',
        },
    ],
});

BingoCards.belongsTo(User, { foreignKey: 'user_id' });
BingoCards.belongsTo(Game, { foreignKey: 'game_id' });
User.hasMany(BingoCards, { foreignKey: 'user_id' });
Game.hasMany(BingoCards, { foreignKey: 'game_id' });

export default BingoCards;
