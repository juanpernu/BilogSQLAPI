class Permission {
  constructor() {
    this.permissions
  }

  savePermissions(permissions) {
    this.permissions = permissions.map(element => {
      return {
        item: element.item_sistema,
        option: element.opcion
      }
    });
  }
}

module.exports = Permission;
