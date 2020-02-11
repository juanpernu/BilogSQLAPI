const sql = require('mssql');
const CustomError = require('../utils/CustomError');

/**
 * Method to get the user data on the first login.
 * @param {Object} config Config for the server connection
 * @param {String} query Query to make the server request
 * @param {Function} next Error middleware method
 */
async function getUserDataFromServer(config, query, next) {
  const pool = await this.connectToServer(config, next);

  try {
    const response = await this.makeRequest(pool, query, next);
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

/**
 * Method to separate the server connection to allow
 * to keep alive the connection to use less resource.
 * @param {Object} config Config for the server connection
 * @param {Function} next Error middleware method
 */
async function connectToServer(config, next) {
  const pool = new sql.ConnectionPool(config);
  const poolConnect = pool.connect();

  pool.on('error', err => {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to POST login data', err);
    return error;
  });

  try {
    const pool = await poolConnect; // ensures that the pool has been created
    return pool;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying to connect to server', err);
    throw next(error);
  }
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
    return response;
  } catch (err) {
    const error = CustomError.handleError(err.message || 'Unexpected error while trying make que request', err);
    throw next(error);
  }
}

module.exports = {
  getUserDataFromServer,
  connectToServer,
  makeRequest
}