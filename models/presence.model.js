const {Sequelize} = require('sequelize');
const sequelize = new Sequelize('mysql::memory:');


module.exports = (sequelize) => {
    const Presences = sequelize.define('rw_presence', {
        message: Sequelize.STRING,
        user: Sequelize.STRING,
        presence: {
            type: Sequelize.SMALLINT,
            defaultValue: 0,
            allowNull: false,
        }
    });
}