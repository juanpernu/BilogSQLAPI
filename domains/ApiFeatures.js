class APIFeatures {
  constructor() {
    this.query = ''
  }

  makeConfig(isFirstConnection, userData, server, port, database = 'clientes') {
    // Here I hardcode the first connection because
    // for all the users is the same. We have to check this.
    if (isFirstConnection){
      return {
        user: 'consulta',
        password: 'cons1234',
        server,
        port,
        database,
        connectionTimeout: 3000,
        parseJSON: true,
      }
    }

    return {
      user: userData.user,
      password: userData.password,
      server,
      port,
      database,
      connectionTimeout: 3000,
      parseJSON: true,
    }
  }

  flattResponse(arr, d = 1) {
    return arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? this.flattResponse(val, d - 1) : val), []);
  }

  newQuery(query) {
    this.query = query;
  }

  getQuery() {
    return this.query;
  }
}

module.exports = APIFeatures;
