const { Router } = require('express');
const authRouter = Router();
const authController = require('../controllers/authController');

authRouter.get('/login', authController.getLogInForm);
authRouter.post('/login', authController.postLogInForm);

authRouter.get('/signup', authController.getSignUpForm);
authRouter.post('/signup', authController.postSignUpForm);

authRouter.get('/recover', authController.getRecoverForm);
authRouter.post('/recover', authController.postRecoverForm);

module.exports = authRouter;