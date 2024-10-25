// UserGames.js
import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import User from './Users.js';
import Game from './games.js';

const UserGames = db.define('UserGames', {
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    game_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: 'user_games',
    timestamps: false,
});

// Relación muchos a muchos con User
UserGames.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'id',
});

// Relación muchos a muchos con Game
UserGames.belongsTo(Game, {
    foreignKey: 'game_id',
    targetKey: 'id',
});

// Si necesitas definir las relaciones inversas en los modelos User y Game
User.hasMany(UserGames, {
    foreignKey: 'user_id',
    sourceKey: 'id',
});

Game.hasMany(UserGames, {
    foreignKey: 'game_id',
    sourceKey: 'id',
});

export default UserGames;
