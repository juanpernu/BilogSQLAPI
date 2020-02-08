const sql = require('mssql');
const CustomError = require('../utils/CustomError');
const APIFeatures = require('../domains/ApiFeatures');
const User = require('../domains/User');

async function getDataFromUser(config, query, next) {
  const pool = new sql.ConnectionPool(config);
  const poolConnect = pool.connect();

  pool.on('error', err => {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to POST login data', err);
    return error;
  });

  try {
    await poolConnect; // ensures that the pool has been created
    const request = pool.request(); // or: new sql.Request(pool1)
    const JSONresponse = await request.query(query);
    const response = JSONresponse.recordset;
    pool.close();

    if (response && response[0] === null) {
      throw error = {
        message: 'Unhautorized user :: Invalid login',
        code: 401
      };
    };

    return response;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to POST login data', err);
    throw next(error);
  }
}

async function validateUser(user, user_bilog, password, next) {
  const newUser = new User({ user, user_bilog, password});
  const features = new APIFeatures();

  // Make the query and the config for the first connection
  features.newQuery(`SELECT * FROM clientes WHERE cliente = '${user_bilog}' FOR JSON PATH`);
  const config = features.makeConfig(true, newUser.access);

  try {
    // Get user database data
    let response = await this.getDataFromUser(config, features.getQuery(), next);
    const flatted = features.flattResponse(response, 2);

    // Make a new connection with the user database data
    const { base, ip_sql, puerto } = flatted[0];
    const newConfig = features.makeConfig(false, newUser.access, ip_sql, parseInt(puerto), base);
    
    features.newQuery(`SELECT * FROM usuarios WHERE usuario = '${user}'`);

    // Get user data
    const userData = await this.getDataFromUser(newConfig, features.getQuery(), next);

    if (userData && !userData[0].habilitado) {
      const error = CustomError.handleError({
        message: 'Unabled user :: This user is not enabled',
        code: 401
      });
      throw next(error);
    }

    return userData;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to Validate user data', err);
    throw next(error);
  }
}

module.exports = {
  getDataFromUser,
  validateUser,
}