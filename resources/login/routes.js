const express = require('express');
const router = express.Router();
const LoginController = require('./controller');

router
  .route('/:user')
  .post(LoginController.post)

module.exports = router;
