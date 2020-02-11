const sql = require('mssql');
const CustomError = require('../utils/CustomError');

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