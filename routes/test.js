const express = require('express');
const sql = require('mssql');
const router = express.Router();

router
  .route('/')
  .get(async (req, res) => {
    // create Request object
    const request = new sql.Request();
    // query to the database and get the records
    try {
      const JSONresponse = await request.query("SELECT * FROM pacientes WHERE (ape_nom LIKE N'Perez %') FOR JSON PATH");
      const response = JSONresponse.recordset[0];
      res.status(200).send(response);
    } catch (err) {
      console.error('ERROR :: ', err.code, err.message);
    }
  });

module.exports = router;
