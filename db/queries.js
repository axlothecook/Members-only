const pool = require('./pool');

// USER RELATED
//CREATE USER
async function registerUser(firstName, lastName, email, username, password, imgPath, membershipTier) {
    const { rows } = await pool.query(`
        INSERT INTO users (firstname, lastname, email, username, password, imgPath, membershiptier) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *`, 
        [firstName, lastName, email, username, password, imgPath, membershipTier]
    );
    return rows[0];
};

//CHECK FOR LOG IN
async function checkUserByUsername(username) {
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return rows[0];
};

// CHECK WHEN REGISTERING
async function checkUserByEmail(email) {
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    return rows;
};

// CHECK USER FOR SESSION
async function checkUserById(id) {
    const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [id]);
    return rows[0];
};

// CHANGE PASSWORD 
async function changePassword(email, newPassword) {
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email]);
};

// UPGRATE MEMBERSHIP
async function upgradeMembership(tier, id) {
    await pool.query("UPDATE users SET membershiptier = $1 WHERE user_id = $2", [tier, id]);
};

//  UPDATE USER
async function updateUser(firstName, lastName, email, username, hashedPassword, imageProvided, membershiptier, id) {
    await pool.query(`
        UPDATE users 
        SET firstname = $1, lastname = $2, email = $3, username = $4, password = $5, imgpath = $6, membershiptier = $7 
        WHERE user_id = $8`,
        [firstName, lastName, email, username, hashedPassword, imageProvided, membershiptier, id]
    );
};

// DLT ACCOUNT
async function dltUser(id) {
    const { rows } = await pool.query('SELECT post_id FROM users_posts WHERE user_id = $1', [id]);
    if (rows) {
        await pool.query(`DELETE FROM users_posts WHERE user_id = $1`, [id]);
        const postsIdArray = rows.map(item => item.post_id);
        await pool.query(`DELETE FROM posts WHERE post_id = ANY($1)`, [postsIdArray]);
    };
    await pool.query(`DELETE FROM users WHERE user_id = $1`, [id]);
};

// POST RELATED
// GET ALL POSTS
async function getAllPosts(id) {
    let { rows } = await pool.query(`SELECT post_id FROM users_posts WHERE user_id = $1`, [id]);
    if (rows.length !== 0) {
        const postsIdArray = rows.map(item => item.post_id);
        ({ rows } = await pool.query('SELECT * FROM posts'));
        rows.map(el => (postsIdArray.includes(el.post_id)) ? el.owned = true : null);
    } else ({ rows } = await pool.query('SELECT * FROM posts'));
    let postsArr = rows;
    ({ rows } = await pool.query('SELECT * FROM users_posts'));
    let users_postsArr = rows;
    ({ rows } = await pool.query('SELECT user_id, username, imgpath, membershiptier FROM users'));
    let usersArr = rows;
    ({ rows } = await pool.query('SELECT membershiptier FROM users WHERE user_id = $1', [id]));
    for (let i = 0; i < postsArr.length; i++) {
        if (postsArr[i].post_id === users_postsArr[i].post_id) {
            let userId = users_postsArr[i].user_id;
            usersArr.forEach(user => {
                if (user.user_id === userId) {
                    postsArr[i].user = user.username;
                    postsArr[i].url = user.imgpath;
                    postsArr[i].membershiptier = rows[0].membershiptier;
                };
            });
        };
    };
    return postsArr;
};

// GET ALL POSTS FOR SPECIFIC USER
async function getAllPostsForSpecificUser(id, username, url) {
    let { rows } = await pool.query(`SELECT post_id FROM users_posts WHERE user_id = $1`, [id]);
    if (rows.length !== 0) {
        let postsIdArray = rows.map(item => item.post_id);
        ({ rows } = await pool.query(`SELECT * FROM posts WHERE post_id = ANY($1)`, [postsIdArray]));
        rows.map(el => {
            el.user = username;
            el.owned = true;
            el.url = url;
        }); 
    };
    return rows;
};

// CREATE A POST
async function addPost({ content, title, date }, userId) {
    const { rows } = await pool.query(`
        INSERT INTO posts (title, date, content) VALUES ($1, $2, $3) RETURNING post_id`, 
        [title, date, content]
    );
    const postId = rows[0].post_id;
    await pool.query(`
        INSERT INTO users_posts (user_id, post_id) VALUES ($1, $2)`, 
        [userId, postId]
    ); 
};

// EDIT POST
async function getSpecificPost(id) {
    const { rows } = await pool.query('SELECT * FROM posts WHERE post_id = $1', [id]);
    return rows[0];
};

async function editPost({ title, content }, id) {
    await pool.query(`
        UPDATE posts 
        SET title = $1, content = $2 
        WHERE post_id = $3`,
        [title, content, id]
    );
};

// DLT POST
async function dltPost(id) {
    await pool.query(`DELETE FROM users_posts WHERE post_id = $1`, [id]);
    await pool.query(`DELETE FROM posts WHERE post_id = $1`, [id]);
};

module.exports = {
    getAllPosts,
    getAllPostsForSpecificUser,
    getSpecificPost,
    editPost,
    dltPost,
    registerUser,
    checkUserByUsername,
    checkUserByEmail,
    checkUserById,
    changePassword,
    upgradeMembership,
    addPost,
    updateUser,
    dltUser
};