import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import Game from './games.js';

const CalledNumbers = db.define('CalledNumbers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'games',
            key: 'id',
        },
    },
    number_called: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 75,
        },
    },
    called_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'called_numbers',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['game_id', 'number_called'],
            name: 'called_numbers_game_number_unique',
        },
    ],
});

CalledNumbers.belongsTo(Game, { foreignKey: 'game_id' });
Game.hasMany(CalledNumbers, { foreignKey: 'game_id' });

export default CalledNumbers;
