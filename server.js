const sql = require('mssql');
const app = require('./app');
const config = require('./config');

const useConfig = process.env.NODE_ENV ? config.development : config;

const conectToServer = async () => {
  // connect to the database
  try {
    await sql.connect(useConfig);
    console.log('Connection to database succeful.');
  } catch (err) {
    console.error('ERROR :: ', err.code, err.message);
  }
}

app.listen(3000, () => {
  console.log('Server is running..');
  conectToServer();
});
