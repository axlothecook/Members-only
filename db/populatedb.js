const { Client } = require('pg');
require('dotenv').config();

const SQL = `
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    firstname VARCHAR ( 255 ),
    lastname VARCHAR ( 255 ),
    email VARCHAR ( 255 ),
    username VARCHAR ( 255 ),
    password VARCHAR ( 255 ),
    imgPath VARCHAR ( 255 ),
    membershiptier VARCHAR ( 255 )
);

CREATE TABLE posts (
    post_id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title VARCHAR ( 255 ),
    date VARCHAR ( 255 ),
    content VARCHAR ( 255 )
);

CREATE TABLE users_posts (
    user_id INTEGER references users(user_id),
    post_id INTEGER references posts(post_id),
    primary key(user_id, post_id)
);
`;

const main = async () => {
    ('seeding...');
    const client = new Client({ connectionString: process.env.NODE_ENV_DB_LOCALHOST });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log('done');
};

main();