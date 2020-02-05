const express = require('express');
const app = express();
const testRoutes = require('./routes/test');

app.get('/', testRoutes);

module.exports = app;
