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

  const response = await this.makeRequest(pool, query);
  pool.close();

  if (response && response[0] === null || response.length === 0) {
    throw error = {
      message: `Unhautorized user :: Invalid login for bilog user: ${config.user}`,
      code: 401
    };
  };

  return response;
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
      throw error = {
        message: `Unhautorized user :: Invalid login for user ${config.user}`,
        code: 401
      };
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
        throw error = {
          message: `Error on fallback connection server :: ${backupConfig.server}:${backupConfig.port}`,
          code: err.code
        };
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
async function makeRequest(pool, query) {
  if(!pool) {
    throw error = {
      message: `Error on makeRequest :: Pool doesn't exist or is null`,
      code: err.code
    };
  }
  const request = pool.request(); // or: new sql.Request(pool1)
  const JSONresponse = await request.query(query);
  const response = JSONresponse.recordset;
  return response;
}

module.exports = {
  getUserDataFromServer,
  connectToServer,
  makeRequest,
  openPool
}