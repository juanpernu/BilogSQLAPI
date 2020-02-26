const PermissionsService = require('./../../services/PermissionsService');
const Response = require('./../../domains/Response');
const CustomError = require('../../utils/Error');

class PermissionsController {
  static async post(req, res, next) {
    try {
      // Get user data from POST body
      const { user, user_bilog, password } = req.body;
      const data = await PermissionsService.validateUser(user, user_bilog, password, next);
      const response = new Response({ data: data, message: 'POST Sucessfull', code: 200});

      res.status(200).send(response);
    } catch (err) {
      const error = CustomError.handleError(err.message || 'Unexpected error while trying to POST login data', err);
      return res.status(err.code).send({ error: { message: error.message, code:err.code} });
    }
  }
}

module.exports = PermissionsController;
