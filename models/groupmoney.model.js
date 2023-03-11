const {Sequelize} = require('sequelize');
const {sequelize} = require('../modules/connections/mysql');


const GroupMoney = sequelize.define('rw_groupmoney', {
    guild: Sequelize.STRING,
    type: Sequelize.ENUM({
        values: ['add', 'remove']
    }),
    amount: Sequelize.FLOAT,
    description: Sequelize.STRING,
    user: Sequelize.STRING
});

GroupMoney.sync().then(() => {
    console.log('GroupMoney table created successfully!');
}).catch((error) => {
    console.error('Unable to create table : ', error);
});

module.exports = {GroupMoney};