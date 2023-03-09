const {Sequelize} = require('sequelize');
const {sequelize} = require('../modules/connections/mysql');


const Settings = sequelize.define('rw_settings', {
    name: Sequelize.STRING,
    guild: Sequelize.STRING,
    value: Sequelize.STRING,
});

Settings.sync(true).then(() => {
    console.log('Settings table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

module.exports = {Settings};