const redis = require('redis');
const client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on('error', function(err) {
  console.log('Error ' + err);
});
//select - create db
const setAddresses = data => {
  data.forEach(item => {
    client.set(item.id, item.address);
  });
};

const dump = () => {
  client.SAVE((err, reply) => {
    console.log(reply);
  });
};

const getAddresses = () =>
  new Promise((res, rej) => {
    client.keys('*', (err, keys) => {
      client.mget(keys, (err, reply) => res(reply));
    });
  });

const getAddress = id =>
  new Promise((res, rej) => client.get(id, (err, reply) => (err ? rej(err) : res(reply))));

module.exports = {
  setAddresses,
  dump,
  getAddresses,
  getAddress
};
