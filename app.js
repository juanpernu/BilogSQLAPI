const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const errorHandler = require('./utils/Error');
const permissionsRoutes = require('./resources/permissions/routes');

const App = express();

// Middleweares
if (process.env.NODE_ENV === 'development') {
  App.use(morgan('dev'));
}

App.use(bodyParser.json());
App.use(bodyParser.urlencoded({ extended: true }));
App.use(helmet());
App.use(cors());

App.use('/permissions', permissionsRoutes);
App.use(errorHandler);

App.disable('etag');
App.disable('x-powered-by');

module.exports = App;
