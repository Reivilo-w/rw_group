const {client} = require('./connections/discord');
const {sequelize} = require('./connections/mysql');

module.exports = {client, sequelize};