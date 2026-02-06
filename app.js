const express = require('express');
const app = express();
const path = require ('node:path');
const morgan = require('morgan');
const indexRouter = require('./routes/indexRouter');
const authRouter = require('./routes/authRouter');
const userRouter = require('./routes/userRouter');
require('dotenv').config();
const session = require("express-session");
const passport = require("passport");
const multer = require('multer');

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        const temp = Math.floor(Math.random() * 100);
        cb(null, temp + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    (file.mimetype === 'image/png' || 
        file.mimetype === 'image/jpg' || 
        file.mimetype === 'image/jpeg'
    ) ? cb(null, true) : cb(null, false);  
};

app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));
app.use(session({ secret: "cats", resave: false, saveUninitialized: false }));
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use('/auth', authRouter);
app.use('/', indexRouter);
app.use('/user', userRouter);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message);
});

app.use((req, res) => {
    res.status(404).sendFile('/public/404.html', { root: __dirname });
});

const PORT = process.env.NODE_ENV_PORT_LOCALHOST || 3005;
app.listen(PORT, (error) => {
    if (error) throw error;
    console.log(`The app launched is listening on port ${PORT}!`);
});