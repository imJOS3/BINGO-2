import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import User from './Users.js';
import Game from './games.js';
import BingoCards from './bingoCards.js';

const UserGames = db.define('UserGames', {
    user_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { 
            model: User, 
            key: 'id' 
        }
    },
    game_id: { 
        type: DataTypes.INTEGER, 
        allowNull: false,
        references: { 
            model: Game, 
            key: 'id' 
        }
    },
    bingo_card_id: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
        references: { 
            model: BingoCards, 
            key: 'id' 
        }
    },
}, {
    tableName: 'user_games',
    timestamps: false,
});

// Relación muchos a uno con User
UserGames.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'id',
});

// Relación muchos a uno con Game
UserGames.belongsTo(Game, {
    foreignKey: 'game_id',
    targetKey: 'id',
});

// Relación muchos a uno con BingoCard
UserGames.belongsTo(BingoCards, {
    foreignKey: 'bingo_card_id',
    targetKey: 'id',
});

// Relación inversa en User
User.hasMany(UserGames, {
    foreignKey: 'user_id',
    sourceKey: 'id',
});

// Relación inversa en Game
Game.hasMany(UserGames, {
    foreignKey: 'game_id',
    sourceKey: 'id',
});

// Relación inversa en BingoCard
BingoCards.hasMany(UserGames, {
    foreignKey: 'bingo_card_id',
    sourceKey: 'id',
});

export default UserGames;
