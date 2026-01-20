//don't forget to add .env file

const db = require('../db/queries');

const { navLinks } = require('../data');

const getHomepage = (req, res) => {
    // const genreList = await db.getAllGenres();

    res.render('index', {
        title: 'Authentication Practice',
        navLinks,
        errors: null
    });
};

module.exports = {
    getHomepage
}