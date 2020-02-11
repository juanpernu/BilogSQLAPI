const APIFeatures = require('../domains/ApiFeatures');
const User = require('../domains/User');
const CustomError = require('../utils/CustomError');
const MakeQueries = require('../utils/Queries');
const SQLService = require('../services/SQLService');

async function validateUser(user, user_bilog, password, next) {
  const newUser = new User({ user, user_bilog, password });
  const features = new APIFeatures();

  // Make the query and the config for the first connection
  features.newQuery(MakeQueries('GET_USER_DATABASE', user_bilog));
  const config = features.makeConfig(true, newUser.access);

  try {
    // Get user database data
    let response = await SQLService.getDataFromServer(config, features.getQuery(), next);
    const flatted = features.flattResponse(response, 2);

    // Make a new connection with the user database data
    const { base, ip_sql, puerto } = flatted[0];
    const newConfig = features.makeConfig(false, newUser.access, ip_sql, parseInt(puerto), base);
    
    features.newQuery(MakeQueries('SELECT_USER_DATABASE', user));

    // Get user data
    const userData = await SQLService.getDataFromServer(newConfig, features.getQuery(), next);
    newUser.updateUserData(...userData);

    const permissions = await this.validatePermissions(newUser, newConfig, next);
    

    if (userData && !newUser.isEnabled) {
      const error = CustomError.handleError({
        message: 'Unabled user :: This user is not enabled',
        code: 401
      });
      throw next(error);
    }

    return permissions;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
    throw next(error);
  }
}

async function validatePermissions(user, config, next, permissionItemToValidate = '', permissionToValidate = '') {
  const features = new APIFeatures();
  const isFirstLogin = !user.isSupervisor && permissionItemToValidate === '' && permissionToValidate === '';
  
  if (isFirstLogin || user.isSupervisor) {
    features.newQuery(MakeQueries('VALIDATE_PERMISSION', user.id));
    const permissions = await SQLService.getDataFromServer(config, features.getQuery(), next);
    return permissions;
  }
}

module.exports = {
  validateUser,
  validatePermissions
}