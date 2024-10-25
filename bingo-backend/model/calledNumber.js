import { DataTypes } from 'sequelize';
import db from '../database/db.js';


const CalledNumbers = db.define('CalledNumbers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    game_id: {  // Llave foránea
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    number_called: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    called_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,  // Valor por defecto
    },
}, {
    tableName: 'called_numbers',
    timestamps: false
});


export default CalledNumbers;
