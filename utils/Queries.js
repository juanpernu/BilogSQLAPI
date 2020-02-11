const makeQuery = (queryInput, queryData) => {
  const query = {
    GET_USER_DATABASE: `SELECT * FROM clientes WHERE cliente = '${queryData}' FOR JSON PATH`,
    SELECT_USER_DATABASE: `SELECT * FROM usuarios WHERE usuario = '${queryData}'`,
    VALIDATE_PERMISSION: `SELECT permisos.id_permiso, permisos.id_usuario, permisos.id_proceso, procesos.item_sistema, procesos.opcion FROM permisos INNER JOIN procesos ON permisos.id_proceso = procesos.id_proceso INNER JOIN usuarios ON permisos.id_usuario = usuarios.id_usuario WHERE(permisos.id_usuario = ${queryData}) ORDER BY permisos.id_proceso`,
  }

  return query[queryInput];
}

module.exports = makeQuery;
