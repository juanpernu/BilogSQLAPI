const sql = require('mssql');
const CustomError = require('../utils/customError');

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

module.exports = {
  getDataFromUser,
}