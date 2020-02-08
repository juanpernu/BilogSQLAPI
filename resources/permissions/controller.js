// const Schema = require('./schema');
const PermissionsService = require('../../services/PermissionsService');
const CustomError = require('../../utils/CustomError');

class PermissionsController {
  static async post(req, res, next) {
    try {
      // Get user data from POST body
      const { user, user_bilog, password } = req.body;
      const response = await PermissionsService.validateUser(user, user_bilog, password, next);

      res.status(200).send({
        message: 'Success Login POST',
        data: response,
        code: 200,
      });
    } catch (err) {
      const error = CustomError.handleError(err.message || 'Unexpected error while trying to POST login data', err);
      throw next(error);
    }
  }
}

module.exports = PermissionsController;
