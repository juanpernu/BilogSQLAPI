const express = require('express');
const app = express();
const loginRoutes = require('./resources/login/routes');

app.use('/login', loginRoutes);

module.exports = app;
