const db = require('../db/queries');
const { navLinks } = require('../data');

// GET HOMEPAGE

const getHomepage = async (req, res) => {
  const postsArr = await db.getAllPosts(req.user.user_id);
  res.render('index', {
    title: 'Welcome to the Club!',
    navLinks,
    user: req.user,
    postsArr
  });
};

// GET LOG OUT
const getLogOutForm = async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/auth/login');
  });
};

module.exports = {
  getHomepage,
  getLogOutForm
};