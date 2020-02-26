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
async function getUserDataFromServer(user, query) {
  const features = new APIFeatures();

  const config = features.makeConfig(true, user.access, first.server, first.port);
  const bkConfig = features.makeConfig(true, user.access, second.server, second.port);
  let pool = await this.connectToServer(config, bkConfig);

  try {
    const response = await this.makeRequest(pool, query);
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
    throw error;
  }
}

/**
 * Method to separate the server connection to allow
 * to keep alive the connection to use less resource.
 * @param {Object} config Config for the server connection
 * @param {Function} next Error middleware method
 */
async function connectToServer(config, backupConfig = {}) {
  try {
    const connection = await this.openPool(config);
    return connection;
  } catch (err) {
    if (err.code === 'ELOGIN') {
      const error = CustomError.handleError(err.message, err);
      throw error;
    }
    
    const backupConfigExist = Object.entries(backupConfig).length > 1;
    // TODO: To get better performance, to select
    // to wich server to connect, should do a PING
    // If the response is ok, connect to that.
    if (backupConfigExist) {
      try {
        const connection = await this.openPool(backupConfig);
        return connection;
      } catch (err) {
        const error = CustomError.handleError(`Error on fallback connection server :: ${err.message}`, err);
        throw error;
      }
    }
  }
}

async function openPool(config) {
  try {
    let pool = new sql.ConnectionPool(config);
    let poolConnect = pool.connect();
    pool = await poolConnect; // ensures that the pool has been created
    return pool; 
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Invalid user', err);
    throw error;
  }
}

/**
 * Method to separate the request th the server
 * from the connection.
 * @param {InstanceType} pool Server pool connection
 * @param {String} query Query to make the server request
 * @param {Function} next Error middleware method
 */
async function makeRequest(pool, query) {
  if(!pool) {
    const error = CustomError.handleError("Pool doesn't exist or is not given to make request");
    throw error;
  }
  const request = pool.request(); // or: new sql.Request(pool1)
  try {
    const JSONresponse = await request.query(query);
    const response = JSONresponse.recordset;
    return response;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying make que request', err);
    throw error;
  }
}

module.exports = {
  getUserDataFromServer,
  connectToServer,
  makeRequest,
  openPool
}