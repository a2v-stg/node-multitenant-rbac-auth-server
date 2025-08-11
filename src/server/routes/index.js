module.exports = {
  auth: require('./auth'),
  tenant: require('./tenant'),
  user: require('./user'),
  rbac: require('./rbac'),
  blacklist: require('./blacklist'),
  //core: require('./core'),
  settings: require('./settings'),
  test: require('../tests/unit/routes.test')
};
