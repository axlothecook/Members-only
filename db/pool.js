const { Pool } = require('pg');
require('dotenv').config();

module.exports = new Pool({ 
    connectionString: process.env.NODE_ENV_DB_LOCALHOST
});