const APIFeatures = require('../domains/ApiFeatures');
const User = require('../domains/User');
const CustomError = require('../utils/CustomError');
const MakeQueries = require('../utils/Queries');
const SQLService = require('../services/SQLService');

/**
 * Method to validate that the user exist on
 * the database and is still operating.
 * @param {String} user User input data
 * @param {String} user_bilog Bilog user input data
 * @param {String} password User password input data
 * @param {Function} next Error middleware method
 */
async function validateUser(user, user_bilog, password, next) {
  const newUser = new User({ user, user_bilog, password });
  const features = new APIFeatures();

  // Make the query and the config for the first connection
  features.newQuery(MakeQueries('GET_USER_DATABASE', user_bilog));
  const config = features.makeConfig(true, newUser.access);

  try {
    // Get user database data
    let response = await SQLService.getUserDataFromServer(config, features.getQuery(), next);
    const flatted = features.flattResponse(response, 2);

    // Make a new connection with the user database data
    const { base, ip_sql, puerto } = flatted[0];
    const newConfig = features.makeConfig(false, newUser.access, ip_sql, parseInt(puerto), base);
    
    features.newQuery(MakeQueries('SELECT_USER_DATABASE', user));

    // Get user data
    const newPool = await SQLService.connectToServer(newConfig, next);
    const userData = await SQLService.makeRequest(newPool, features.getQuery(), next);
    newUser.updateUserData(...userData);

    if (userData && !newUser.isEnabled) {
      const error = CustomError.handleError({
        message: 'Unabled user :: This user is not enabled',
        code: 401
      });
      throw next(error);
    }

    const permissions = await this.getPermissions(newUser, newPool, next);
    newPool.close();

    return permissions;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
    throw next(error);
  }
}

/**
 * Method to validate if the user has the permissions
 * to operate in the sistem.
 * @param {User} user User instance
 * @param {InstanceType} pool Server pool connection
 * @param {Function} next Error middleware method
 * @param {String} permissionItemToValidate Permission item to validate
 * @param {String} permissionToValidate General permission to validate
 */
async function validatePermissions(user, pool, next, permissionItemToValidate = '', permissionToValidate = '') {
  const features = new APIFeatures();
  const isFirstLogin = !user.isSupervisor && permissionItemToValidate === '' && permissionToValidate === '';
  
  if (isFirstLogin || user.isSupervisor) {
    features.newQuery(MakeQueries('VALIDATE_PERMISSION', user.id));
    try {
      const permissions = await SQLService.makeRequest(pool, features.getQuery());
      return permissions;
    } catch (err) {
      const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
      throw next(error);
    }
  }
}

/**
 * Method to get users permissions.
 * @param {User} user User instance
 * @param {InstanceType} pool Server pool connection
 * @param {Function} next Error middleware method
 */
async function getPermissions(user, pool, next) {
  try {
    const permissions = await this.validatePermissions(user, pool, next);
    return permissions;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying get user permissions', err);
    throw next(error);
  }
}

module.exports = {
  validateUser,
  validatePermissions,
  getPermissions
}