// User.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const User = db.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    nickname: { type: DataTypes.STRING(20), allowNull: false },
}, {
    tableName: 'users',
    timestamps: true,
});



export default User;
