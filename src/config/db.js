const Pool = require("pg").Pool;

const pool = new Pool({
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_DATABASE,
    host: process.env.BD_HOST,
    port: process.env.BD_PORT
});

module.exports = pool;