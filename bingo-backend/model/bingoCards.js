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
            model: 'users',       
            key: 'id'
        }
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'games',       
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
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'game_id'] //combinación única
        }
    ]
});

export default BingoCards;
