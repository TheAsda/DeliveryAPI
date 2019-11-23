const models = require('./databases/mongo');
const postgres = require('./databases/sql');
const redis = require('./databases/redis');
const buildGraph = require('./databases/neo4j').buildGraph;

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

module.exports = () => {
  checkForUpdates();
  postgres.getAddressesByDistrict().then(data => buildGraph(data));
  return { mongo: models, postgres, redis };
};
