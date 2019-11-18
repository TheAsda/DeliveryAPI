const models = require('./databases/mongo');
const postgres = require('./databases/sql');
const redis = require('./databases/redis');

module.exports = () => {
  //check addresses
  /*postgres.getAddresses().then(data => {
    //redisMethods.setAddresses([...data.storages, ...data.pickPoints]);
    //redisMethods.getAddresses().then(data => console.log(data));
    //redis.dump();
  });*/

  return { mongo: models, postgres, redis };
};
