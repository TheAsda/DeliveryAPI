const models = require('./databases/mongo');
const postgres = require('./databases/postgres');
const redis = require('./databases/redis');
const { buildGraph, findPath } = require('./databases/neo4j');
const { log, getPaidByDate } = require('./databases/elastic');

const checkForUpdates = () => {
  postgres.getAddresses().then(async data => {
    const redisData = await redis.getAddresses();
    for (let field in data) {
      log(
        'debug',
        `Redis has ${Object.keys(redisData[field]).length} ${field}`
      );
      log('debug', `Postgres has ${data[field].length} ${field}`);
      if (data[field].length !== Object.keys(redisData[field]).length) {
        log('info', 'Updating addresses');
        redis.clear();
        redis.setAddresses(data);
        redis.dump();
        fillNeo4j();
        return;
      }
    }
    log('info', 'No need to update addresses');
  });
};

const fillNeo4j = () => {
  postgres.getAddressesByDistrict().then(data => buildGraph(data));
};

const addPoint = data => {
  postgres.addPoint(data).then(() => {
    checkForUpdates();
  });
};

const deletePoint = id => {
  postgres.deletePoint(id).then(() => {
    checkForUpdates();
  });
};

module.exports = {
  init: () => {
    checkForUpdates();
  },
  mongo: models,
  postgres,
  redis,
  neo4j: { findPath },
  deletePoint,
  addPoint,
  log,
  elastic: {
    getPaidByDate
  }
};
