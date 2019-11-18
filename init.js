const models = undefined; // require('./databases/mongo');
const postgres = require('./databases/sql');
const redis = require('./databases/redis');

const update = () => {
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
  update();

  return { mongo: models, postgres, redis };
};
