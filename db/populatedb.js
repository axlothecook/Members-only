const { Client } = require('pg');
require('dotenv').config();

const SQL = ``;

const main = async () => {
    ('seeding...');
    const client = new Client({ connectionString: process.env.NODE_ENV_DB_LOCALHOST });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log('done');
};

main();