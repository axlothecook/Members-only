const { Router } = require('express');
const indexRouter = Router();
const indexController = require('../controllers/indexController');

const myAuthenticatedMiddleware = (req, res, next) => {
  if (req.user) {
    return next();
  }
  res.redirect('/auth/login');
};

indexRouter.get('/', myAuthenticatedMiddleware, indexController.getHomepage);

indexRouter.get('/logout', indexController.getLogOutForm);

module.exports = indexRouter;