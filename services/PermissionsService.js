const APIFeatures = require('../domains/ApiFeatures');
const User = require('../domains/User');
const MakeQueries = require('./../utils/Queries');
const CustomError = require('../utils/Error');
const SQLService = require('./../services/SQLService');

/**
 * Method to validate that the user exist on
 * the database and is still operating.
 * @param {String} user User input data
 * @param {String} user_bilog Bilog user input data
 * @param {String} password User password input data
 * @param {Function} next Error middleware method
 */
async function validateUser(user, user_bilog, password) {
  const newUser = new User({ user, user_bilog, password });
  const features = new APIFeatures();

  // Make the query and the config for the first connection
  features.newQuery(MakeQueries('GET_USER_DATABASE', user_bilog));
  try {
    // Get user database data
    let response = await SQLService.getUserDataFromServer(newUser, features.getQuery());
    const flatted = features.flattResponse(response, 2);    

    // Make a new connection with the user database data
    const { base, ip_sql, puerto } = flatted[0];
    const newConfig = features.makeConfig(false, newUser.access, ip_sql, parseInt(puerto), base);
    
    features.newQuery(MakeQueries('SELECT_USER_DATABASE', user));

    // Get user data
    const newPool = await SQLService.connectToServer(newConfig);
    const userData = newPool && await SQLService.makeRequest(newPool, features.getQuery());
    newUser.updateUserData(...userData);

    if (userData && !newUser.isEnabled) {
      const error = CustomError.handleError('Unabled user :: This user is not enabled', err);
      newPool.close();
      throw next(error);
    }

    const permissions = await this.getPermissions(newUser, newPool);
    newPool.close();

    return permissions;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
    throw error;
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
async function validatePermissions(user, permissionItemToValidate = '', permissionToValidate = '') {
  const isFirstLogin = !user.isSupervisor && permissionItemToValidate === '' && permissionToValidate === '';
  if (isFirstLogin || user.isSupervisor) return true;
  return false;
}

/**
 * Method to get users permissions.
 * @param {User} user User instance
 * @param {InstanceType} pool Server pool connection
 * @param {Function} next Error middleware method
 */
async function getPermissions(user, pool) {
  const features = new APIFeatures();
  try {
    const hasPermissions = await this.validatePermissions(user);

    // If the user is supervisor or is the first
    // login of the user, doesn't make sense get
    // the user permissions from the database.
    if (!hasPermissions) {
      features.newQuery(MakeQueries('VALIDATE_PERMISSION', user.id));
      try {
        const permissions = await SQLService.makeRequest(pool, features.getQuery());
        user.setUserPermissions(permissions);
      } catch (err) {
        const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
        throw error;
      }
    }

    // If the user is supervisor or is the first login
    // here just return the user object without permissions
    return user;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying get user permissions', err);
    throw error;
  }
}

module.exports = {
  validateUser,
  validatePermissions,
  getPermissions
}