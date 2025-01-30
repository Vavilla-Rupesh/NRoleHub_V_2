const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/dataBase');

const TempPasswordReset = sequelize.define('TempPasswordReset', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    otp: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    otp_expires: {
        type: DataTypes.DATE,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'TempPasswordResets',
    timestamps: false
});

module.exports = TempPasswordReset;