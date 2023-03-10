const {Sequelize} = require('sequelize');
const {sequelize} = require('../modules/connections/mysql');


const PresenceMessages = sequelize.define('rw_presences_messages', {
    messagePresence: Sequelize.STRING,
    messagePing: Sequelize.STRING
});

PresenceMessages.sync().then(() => {
    console.log('PresenceMessages table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

module.exports = {PresenceMessages};