const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const permissionsRoutes = require('./resources/permissions/routes');

const App = express();

// Middleweares
if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

App.use(bodyParser.json());
App.use(helmet());
App.use(cors());

App.use('/permissions', permissionsRoutes);

module.exports = App;
