import { DataTypes } from "sequelize";
import db from '../database/db.js';

const BingoCards = db.define('bingoCards',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull: false

    },
    card_data:{
        type: DataTypes.JSON,
        allowNull: false

    },
    created_at:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
},{

    tableName: 'bingo_cards',
    timestamps: false,  // No se incluyen createdAt ni updatedAt por defecto

}); 

export default BingoCards;