const models = undefined; // require('./databases/mongo');
const postgres = require('./databases/sql');
const redis = require('./databases/redis');

module.exports = () => {
  //check addresses
  postgres.getAddresses().then(data => {
    //console.log(data);
    redis.setAddresses(data);
    redis.getAddresses().then(data => console.log(data));
    //redis.dump();
  });

  return { mongo: models, postgres, redis };
};
