const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/dataBase');
const Team = require('./team.model');

const TeamAttendance = sequelize.define('TeamAttendance', {
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
        },
        unique: true // Make team_id unique to ensure one record per team
    },
    event_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    subevent_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    attendance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    marked_by: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    marked_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'TeamAttendance',
    timestamps: false
});

// Define associations
Team.hasOne(TeamAttendance, { foreignKey: 'team_id' });
TeamAttendance.belongsTo(Team, { foreignKey: 'team_id' });

module.exports = TeamAttendance;