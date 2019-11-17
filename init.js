const models = require('./databases/mongo');

module.exports = () => {
  return { mongo: models };
};
