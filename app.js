const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const loginRoutes = require('./resources/login/routes');

const App = express();

// Middleweares
if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

App.use(bodyParser.json());
App.use('/login', loginRoutes);

module.exports = App;
