const {Sequelize} = require('sequelize');
const {sequelize} = require('../modules/connections/mysql');


const Presences = sequelize.define('rw_presences', {
    message: Sequelize.STRING,
    user: Sequelize.STRING,
    presence: {
        type: Sequelize.SMALLINT,
        defaultValue: 0,
        allowNull: false,
    },
    guild: Sequelize.STRING,
});

Presences.sync({ alter: true }).then(() => {
    console.log('Presences table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

module.exports = {Presences};