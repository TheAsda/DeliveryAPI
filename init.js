const models = require('./databases/mongo');
const postgres = require('./databases/sql');
const redis = require('./databases/redis');
const { buildGraph, findPath } = require('./databases/neo4j');

const checkForUpdates = () => {
  postgres.getAddresses().then(async data => {
    const redisData = await redis.getAddresses();
    for (let field in data) {
      if (data[field].length !== Object.keys(redisData[field]).length) {
        redis.setAddresses(data);
        redis.dump();
      }
    }
  });
};

const fillNeo4j = () => {
  postgres.getAddressesByDistrict().then(data => buildGraph(data));
};

module.exports = () => {
  checkForUpdates();
  return { mongo: models, postgres, redis, neo4j: { findPath } };
};
