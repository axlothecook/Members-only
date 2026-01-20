const pool = require('./pool');

async function getAllProducts() {
    const { rows } = await pool.query(``);
    return rows;
};

module.exports = {
    getAllProducts
};