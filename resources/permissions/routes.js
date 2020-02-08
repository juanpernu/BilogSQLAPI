const express = require('express');
const router = express.Router();
const PermissionsController = require('./controller');

router
  .route('/')
  .post(PermissionsController.post)

module.exports = router;
