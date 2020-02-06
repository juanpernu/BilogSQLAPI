// const Schema = require('./schema');
const CustomError = require('../../utils/customError');

class LoginController {
  static async post(req, res, next) {
    try {
      const { user } = req.params;
      res.status(200).send({
        message: 'Success post',
        user: user,
        code: 200,
      });
    } catch (err) {
      return CustomError.handleError(err.message || 'Unexpected error while trying to post login data', err, next);
    }
  }
}

module.exports = LoginController;
