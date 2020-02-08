const express = require('express');
const router = express.Router();
const LoginController = require('./controller');

router
  .route('/')
  .post(LoginController.post)

module.exports = router;
