const express = require('express');
const app = express();
const path = require ('node:path');
const morgan = require('morgan');
const indexRouter = require('./routes/indexRouter');
require('dotenv').config();

app.use(morgan('dev'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const assetsPath = path.join(__dirname, 'public');
app.use(express.static(assetsPath));

app.use(express.urlencoded({ extended: true }));

app.use('/', indexRouter);

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