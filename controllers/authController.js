const db = require('../db/queries');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const {
  body,
  validationResult,
  matchedData
} = require('express-validator');

const {
  alphaFullNameErr,
  alphaUsernameErr,
  lengthErr,
  emptyErr,
  defaultPfpUrl
} = require('../data');

const validateUser = [
  body('firstName')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} first name.`)
  .isLength({ min: 2, max: 20 }).withMessage(`First name ${lengthErr}`)
  .matches(/^[A-Za-z ]+$/).withMessage(`First name ${alphaFullNameErr}`),
  body('lastName')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} last name.`)
  .isLength({ min: 2, max: 20 }).withMessage(`Last name ${lengthErr}`)
  .matches(/^[A-Za-z ]+$/).withMessage(`Last name ${alphaFullNameErr}`),
  body('email')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} email.`)
  .isLength({ min: 2, max: 70 }).withMessage(`Email must be between 2 and 70 characters.`)
  .isEmail().withMessage('Invalid email address.')
  .custom(async (email) => {
    try {
      const user = await db.checkUserByEmail(email);

      if (user.length !== 0) {
        return Promise.reject('This email is already registered and linked to a user in the system. Please signup with another email or login to your account if it belongs to you.');
      }
    } catch (error) {
      throw error;
    }
  }),
  body('username')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} username.`)
  .isLength({ min: 2, max: 20 }).withMessage(`Username ${lengthErr}`)
  .matches(/^[A-Za-z0-9 ]+$/).withMessage(`Username ${alphaUsernameErr}`),
  body('password')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} password.`)
  .isLength({ min: 2, max: 20 }).withMessage(`Password ${lengthErr}`)
  .isStrongPassword({
    minLength: 4,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  })
  .withMessage('Password needs to be at least 4 characters long, and contain least one uppercase and lowercase letter.'),
  body('confirmPassword')
  .trim()
  .escape()
  .notEmpty().withMessage('Please confirm your password.')
  .custom(
    (confirmPassword, { req: request }) => confirmPassword === request.body.password
  )
  .withMessage('Passwords do not match.'),
];

const validateNewPassword = [
  body('email')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} email.`)
  .isLength({ min: 2, max: 70 }).withMessage(`Email must be between 2 and 70 characters.`)
  .isEmail().withMessage('Invalid email address.')
  .custom(async (email) => {
    try {
      const user = await db.checkUserByEmail(email);

      if (user.length === 0) {
        return Promise.reject('This email is not linked to a user in the system.');
      }
    } catch (error) {
      throw error;
    }
  }),
  body('password')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} password.`)
  .isLength({ min: 2, max: 20 }).withMessage(`Username ${lengthErr}`)
  .isStrongPassword({
    minLength: 4,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  })
  .withMessage('Password needs to be at least 4 characters long, and contain least one uppercase and lowercase letters.'),
  body('confirmPassword')
  .trim()
  .escape()
  .notEmpty().withMessage('Please confirm your password.')
  .custom(
    (confirmPassword, { req: request }) => confirmPassword === request.body.password
  )
  .withMessage('Passwords do not match.'),
];

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await db.checkUserByUsername(username);

      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch(err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.checkUserById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

// GET SIGN UP
const getSignUpForm = (req, res) => {
  res.render('sign-up', {
    title: 'Sign up',
    errors: null
  });
};

// POST SIGN UP
const postSignUpForm = [
  validateUser,
  async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).render('sign-up', {
        title: 'Sign up',
        errors: errors.array()
      });
    };

    try {
      const { firstName, lastName, email, username, password } = matchedData(req);
      const hashedPassword = await bcrypt.hash(password, 10);
      let results = await db.registerUser(firstName, lastName, email, username, hashedPassword, defaultPfpUrl, 'basic');
      res.redirect("/");
    } catch(err) {
      return next(err);
    };
  }
];

// GET LOG IN
const getLogInForm = (req, res) => {
  res.render('login', {
    title: 'Log In',
    warning: null
  });
};

// POST LOG IN 
const postLogInForm = (req, res) => {
  passport.authenticate("local", (err, user, options) => {
    if (user) {
      req.login(user, (error) => {
        error ? res.send(error) : res.redirect('/');
      });
    } else {
      res.status(400).render('login', {
        title: 'Log In',
        warning: options.message
      })
    };
  })(req, res)
};

// GET CHANGE PASSWORD
const getRecoverForm = (req, res) => {
  res.render('recover', {
    title: 'Recover Password',
    errors: null
  });
};

// POST CHANGE PASSWORD
const postRecoverForm = [
  validateNewPassword,
  async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).render('recover', {
        title: 'Recover Password',
        errors: errors.array()
      });
    };

    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      await db.changePassword(req.body.email, hashedPassword);
      res.redirect('/');
    } catch(err) {
      return next(err);
    }
  }
];


module.exports = {
  getLogInForm,
  postLogInForm,

  getSignUpForm,
  postSignUpForm,

  getRecoverForm,
  postRecoverForm
};