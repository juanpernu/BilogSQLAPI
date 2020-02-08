// const Schema = require('./schema');
const LoginService = require('../../services/loginService');
const APIFeatures = require('../../utils/apiFeatures');
const CustomError = require('../../utils/customError');

class LoginController {
  static async post(req, res, next) {
    try {
      // Get user data from POST body
      const { user, user_bilog, password } = req.body;
      const features = new APIFeatures(user, user_bilog, password);

      // Make the query and the config for the first connection
      features.newQuery(`SELECT * FROM clientes WHERE cliente = '${user_bilog}' FOR JSON PATH`);
      const config = features.makeConfig(true);

      // Get user database data
      let response = await LoginService.getDataFromUser(config, features.getQuery(), next); // TODO: Primero tebngo que validar si el usuario bilog existe

      const flatted = features.flattResponse(response, 2);

      // Make a new connection with the user database data
      const { base, ip_sql, puerto } = flatted[0];
      const newConfig = features.makeConfig(false, ip_sql, parseInt(puerto), base);
      features.newQuery(`SELECT * FROM usuarios WHERE usuario = '${user}'`);

      // Get user data
      response = await LoginService.getDataFromUser(newConfig, features.getQuery(), next);

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

  validateUser(userData) {
    if (userData.habilitado) {
      const isSupervisor = es_supervisor && es_supervisor !== null;

      if (isSupervisor) {
        // Si es supervisor, seguramente tenga que
        // ir a buscar los permisos de supervisor.
      }

      // Si es un usuario habilitado pero no es supervisor
      // tengo que ir a buscar que permisos tiene este user
    }
  }
}

module.exports = LoginController;
