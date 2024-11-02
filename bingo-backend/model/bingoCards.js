import { DataTypes } from "sequelize";
import db from '../database/db.js';

const BingoCards = db.define('bingoCards', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',       // Debe coincidir con el nombre de tu tabla de usuarios
            key: 'id'
        }
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'games',       // Debe coincidir con el nombre de tu tabla de juegos
            key: 'id'
        }
    },
    numbers: {
        type: DataTypes.JSON,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bingo_cards',
    timestamps: false
});

export default BingoCards;
