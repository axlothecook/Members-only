const db = require('../db/queries');
const { format } = require('date-fns');
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcryptjs");
const { 
  navLinks, 
  defaultPfpUrl,
  alphaFullNameErr,
  alphaUsernameErr,
  lengthErr,
  emptyErr
} = require('../data');
const {
  body,
  validationResult,
  matchedData
} = require('express-validator');

const validateMsg = [
  body('title')
  .trim()
  .escape()
  .notEmpty().withMessage(`Please enter the title.`)
  .isLength({ min: 2, max: 70 }).withMessage(`Title must be between 2 and 70 characters.`)
  .matches(/^[A-Za-z0-9!.:";,?& ]+$/).withMessage(`Title can only contain letters, numbers, white space, and the following characters: !.:";,?&`),
  body('content')
  .trim()
  .escape()
  .notEmpty().withMessage(`Please write some content fot he post.`)
  .isLength({ min: 2, max: 300 }).withMessage(`Content must be between 2 and 300 characters.`)
  .matches(/^[A-Za-z0-9!.:";,?& ]+$/).withMessage(`Content can only contain letters, numbers, white space, and the following characters: !.:";,?&`),
];

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
  .isEmail().withMessage('Invalid email address.'),
  body('username')
  .trim()
  .escape()
  .notEmpty().withMessage(`${emptyErr} username.`)
  .isLength({ min: 2, max: 20 }).withMessage(`Username ${lengthErr}`)
  .matches(/^[A-Za-z0-9 ]+$/).withMessage(`Username ${alphaUsernameErr}`),
  body('password')
  .trim()
  .escape()
  .optional({checkFalsy: true})
  .isLength({ min: 2, max: 20 }).withMessage(`Password ${lengthErr}`)
  .isStrongPassword({
    minLength: 4,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 0,
  })
  .withMessage('Password needs to be at least 4 characters long, and contain least one uppercase and lowercase letter.'),
];

const validateSecret = [
  body('secret')
  .trim()
  .escape()
  .isLength({ min: 2, max: 50 }).withMessage(`Secret must be between 2 and 50 characters.`)
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

const reformatDate = (date) => {
  return format(date, 'MMM dd, hh:mm a');
};

const getNewPost = (req, res) => {
  console.log('GET NEW POST');
  res.render('user/new-post', {
    title: 'Write a Post',
    userId: req.user.user_id,
    errors: null
  });
};

const postNewPost = [
  validateMsg,
  async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).render('user/new-post', {
        title: 'Write a Post',
        userId: req.user.user_id,
        errors: errors.array()
      });
    };

    try {
      const { title, content } = matchedData(req);
      await db.addPost({ title, content, date: reformatDate(new Date()) }, res.locals.currentUser.user_id);
      res.redirect("/");
    } catch(err) {
      return next(err);
    };
  }
];

const getEditPost = async (req, res) => {
  console.log('GET EDIT POST');
  const post = await db.getSpecificPost(req.params.id);
  res.render('user/edit-post', {
    title: 'Edit a Post',
    userId: req.user.user_id,
    post,
    errors: null
  });
};

const postEditPost = [
  validateMsg,
  async (req, res, next) => {
    console.log('POST EDIT POST');
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      console.log(errors.array());
      const post = await db.getSpecificPost(req.params.id);
      return res.status(400).render('user/edit-post', {
        title: 'Edit a Post',
        post,
        userId: req.user.id,
        errors: errors.array()
      });
    };

    try {
      const { title, content } = matchedData(req);
      await db.editPost({ title, content }, req.params.id);
      res.redirect("/");
    } catch(err) {
      return next(err);
    };
  }
];

const getDltPost = async (req, res) => {
  console.log('GET DLT POST');
  console.log(req.params.id);

  await db.dltPost(req.params.id);

  res.redirect('/');
};

const getAllPosts = async (req, res) => {
  console.log('GET ALL POSTS');
  const postsArr = await db.getAllPostsForSpecificUser(req.user.user_id, req.user.username, req.user.imgpath);
  res.render('user/all-posts', {
    title: 'All Posts',
    navLinks,
    user: req.user,
    postsArr,
    errors: null
  });
};

const getMembership = (req, res) => {
  console.log('GET MEMBERSHIP');
  res.render('partials/membership', {
    title: 'Membership',
    userId: req.user.user_id,
    error: null,
    warning: null
  });
};

const postMembership = [
  validateSecret,
  async (req, res) => {
    console.log('POST MEMBERSHIP');
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(400).render('partials/membership', {
        title: 'Membership',
        userId: req.user.user_id,
        errors: errors.array(),
        warning: null
      });
    };
    const { secret } = matchedData(req);
    switch (secret) {
      case 'secret':
        await db.upgradeMembership('member', req.user.user_id);
        break;
      case 'admin':
        await db.upgradeMembership('admin', req.user.user_id);
        break;
      default:
        return res.render('partials/membership', {
          title: 'Membership',
          userId: req.user.user_id,
          errors: null,
          warning: 'Not the secret :('
        });
    };

    res.redirect('/');
  }
];

const getUpdate = (req, res) => {
  console.log('GET UPDATE USER');
  res.render('user/update', {
    title: 'Update data',
    user: req.user,
    errors: null
  });
};

const postUpdate = [
  validateUser,
  async (req, res, next) => {
    console.log('POST UPDATE USER');
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).render('user/update', {
        title: 'Update data',
        user: req.user,
        errors: errors.array()
      });
    };

    try {
      const { firstName, lastName, email, username, password, image } = matchedData(req);
      if (email != req.user.email) {
        const user = await db.checkUserByEmail(email);

        if (user.length !== 0) {
          return res.status(400).render('user/update', {
            title: 'Update data',
            user: req.user,
            errors: [
              {
                msg: 'This email is already registered and linked to a user in the system. Please signup with another email or login to your account if it belongs to you.'
              }
            ]
          });
        }
      };

      let imageProvided;
      if (req.file) {
        if (!req.file) {
          return res.status(400).render('user/update', {
            title: 'Update data',
            user: req.user,
            errors: [
              {
                msg: 'Incorrect file format provided.'
              }
            ]
          });
        } else imageProvided = `url(/images/${req.file.filename})`;
      };
      
      const hashedPassword = (password && password.length > 0) ? await bcrypt.hash(req.body.password, 10) : req.user.password;
      await db.updateUser(firstName, lastName, email, username, hashedPassword, imageProvided ? imageProvided : req.user.imgpath, req.user.membershiptier, req.user.user_id);
      res.redirect('/');

    } catch(err) {
      return next(err);
    };
  }
];

//fix
const getDelete = async (req, res) => {
  console.log('DELETE USER');
  await db.dltUser(req.user.user_id);
  res.redirect('/auth/login');
};

module.exports = {
  getNewPost,
  postNewPost,
  getEditPost,
  postEditPost,
  getDltPost,
  getAllPosts,
  getMembership,
  postMembership,
  getUpdate,
  postUpdate,
  getDelete
};