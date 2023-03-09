// Connections
const {client} = require('./connections/discord');
const {sequelize} = require('./connections/mysql');

// Embeds
const {presenceEmbed} = require('./embeds/presenceEmbed');

module.exports = {client, sequelize, presenceEmbed};