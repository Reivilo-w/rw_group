const Sequelize = require("sequelize");
const dotenv = require("dotenv");
const env = dotenv.config();

const sequelize = new Sequelize(env.parsed.DB_NAME, env.parsed.DB_USER, env.parsed.DB_PASS, {
    host: env.parsed.DB_HOST,
    dialect: 'mysql',
    logging: false
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});


module.exports = {sequelize};