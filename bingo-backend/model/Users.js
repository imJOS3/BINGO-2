import { DataTypes } from 'sequelize';
import db from '../database/db.js';

const User = db.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: true },
    nickname: { type: DataTypes.STRING(20), allowNull: false, unique: true },
    provider: {
        type: DataTypes.ENUM('local', 'google', 'facebook', 'guest'),
        allowNull: false,
        defaultValue: 'local',
    },
    provider_id: { type: DataTypes.STRING(255), allowNull: true },
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['provider', 'provider_id'],
            name: 'users_provider_provider_id_unique',
        },
    ],
});

export default User;
