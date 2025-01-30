const { DataTypes } = require('sequelize');
const {sequelize} = require('../../config/dataBase')

const Subevent = sequelize.define('Subevent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    certificate_Generated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    resources: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    is_team_event: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    min_team_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 2,
            max: 10
        }
    },
    max_team_size: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 2,
            max: 10
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'Subevents',
    timestamps: false
});

module.exports = Subevent;