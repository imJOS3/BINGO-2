import { DataTypes } from 'sequelize';
import db from '../database/db.js';
import User from './Users.js';
import Game from './games.js';
import BingoCards from './bingoCards.js';

const UserGames = db.define('UserGames', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        },
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Game,
            key: 'id',
        },
    },
    // En cola: entró con la ronda ya empezada, juega desde la siguiente.
    is_spectator: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    bingo_card_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: BingoCards,
            key: 'id',
        },
    },
}, {
    tableName: 'user_games',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'game_id'],
            name: 'user_games_user_game_unique',
        },
    ],
});

UserGames.belongsTo(User, {
    foreignKey: 'user_id',
    targetKey: 'id',
});

UserGames.belongsTo(Game, {
    foreignKey: 'game_id',
    targetKey: 'id',
});

UserGames.belongsTo(BingoCards, {
    foreignKey: 'bingo_card_id',
    targetKey: 'id',
});

User.hasMany(UserGames, {
    foreignKey: 'user_id',
    sourceKey: 'id',
});

Game.hasMany(UserGames, {
    foreignKey: 'game_id',
    sourceKey: 'id',
});

BingoCards.hasMany(UserGames, {
    foreignKey: 'bingo_card_id',
    sourceKey: 'id',
});

export default UserGames;
