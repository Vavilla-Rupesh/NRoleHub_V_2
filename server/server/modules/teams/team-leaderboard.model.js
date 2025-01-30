const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/dataBase');
const Team = require('./team.model');

const TeamLeaderboard = sequelize.define('TeamLeaderboard', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    team_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Team,
            key: 'id'
        }
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subevent_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'TeamLeaderboard',
    timestamps: false
});

// Define associations
Team.hasOne(TeamLeaderboard, { foreignKey: 'team_id' });
TeamLeaderboard.belongsTo(Team, { foreignKey: 'team_id' });

module.exports = TeamLeaderboard;