const sql = require('mssql');
const CustomError = require('../utils/Error');
const { servers: { first, second } } = require('./../utils/ServersAccess');
const APIFeatures = require('./../domains/ApiFeatures');

/**
 * Method to get the user data on the first login.
 * @param {Object} config Config for the server connection
 * @param {String} query Query to make the server request
 * @param {Function} next Error middleware method
 */
async function getUserDataFromServer(user, query, next) {
  const features = new APIFeatures();

  const config = features.makeConfig(true, user.access, first.server, first.port);
  const bkConfig = features.makeConfig(true, user.access, second.server, second.port);
  let pool = await this.connectToServer(config, next, bkConfig);

  try {
    const response = await this.makeRequest(pool, query, next);
    pool.close();

    if (response && response[0] === null || response.length === 0) {
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

/**
 * Method to separate the server connection to allow
 * to keep alive the connection to use less resource.
 * @param {Object} config Config for the server connection
 * @param {Function} next Error middleware method
 */
async function connectToServer(config, next, backupConfig = {}) {
  console.log('CONFIG', config);
  console.log('BKCONFIG', backupConfig);
  try {
    const connection = await this.openPool(config);
    return connection;
  } catch (err) {
    // TODO: To get better performance, to select
    // to wich server to connect, should do a PING
    // If the response is ok, connect to that.
    if(err) {
      const { message, code } = err;
      if (code === 'ELOGIN') {
        const error = CustomError.handleError(`Invalid login for user: ${config.user} :: ${message} :: ${code}` ||
          'Unexpected error while trying to POST login data', err);
        throw next(error);
      }
      try {
        const connection = await this.openPool(backupConfig);
        return connection;
      } catch (err) {
        const error = CustomError.handleError(`Error on fallback connection server :: ${message}` ||
          'Unexpected error while trying to POST login data', err);
        throw next(error);
      }
    }
  }
}

async function openPool(config) {
  let pool = new sql.ConnectionPool(config);
  let poolConnect = pool.connect();
  pool = await poolConnect; // ensures that the pool has been created
  return pool;
}


/**
 * Method to separate the request th the server
 * from the connection.
 * @param {InstanceType} pool Server pool connection
 * @param {String} query Query to make the server request
 * @param {Function} next Error middleware method
 */
async function makeRequest(pool, query, next) {
  const request = pool.request(); // or: new sql.Request(pool1)
  try {
    const JSONresponse = await request.query(query);
    const response = JSONresponse.recordset;
    console.log('RESPONSE length', response.length);
    console.log('RESPONSE item', response[0]);
    return response;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying make que request', err);
    throw next(error);
  }
}

module.exports = {
  getUserDataFromServer,
  connectToServer,
  makeRequest,
  openPool
}