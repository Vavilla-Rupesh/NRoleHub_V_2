const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/dataBase');
const Team = require('./team.model');
const TeamMember = require('./team-member.model');

const TeamCertificate = sequelize.define('TeamCertificate', {
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
    member_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: TeamMember,
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
    certificate_url: {
        type: DataTypes.STRING,
        allowNull: false
    },
    certificate_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    rank: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    issued_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'TeamCertificates',
    timestamps: false
});

// Define associations
Team.hasMany(TeamCertificate, { foreignKey: 'team_id' });
TeamCertificate.belongsTo(Team, { foreignKey: 'team_id' });
TeamMember.hasOne(TeamCertificate, { foreignKey: 'member_id' });
TeamCertificate.belongsTo(TeamMember, { foreignKey: 'member_id' });

module.exports = TeamCertificate;