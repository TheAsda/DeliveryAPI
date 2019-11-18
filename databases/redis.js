const redis = require('redis');
const client = redis.createClient();

client.on('error', function(err) {
  console.log('Error ' + err);
});

const setAddresses = data => {
  data.storages.forEach(storage => {
    client.hset('storages', storage.id, storage.address);
  });

  data.pickPoints.forEach(pickPoint => {
    client.hset('pickPoints', pickPoint.id, pickPoint.address);
  });
};

const dump = () => {
  client.SAVE((err, reply) => {
    console.log(reply);
  });
};

const getAddresses = () => {
  return new Promise((res, rej) => {
    const getStorages = new Promise((res, rej) => {
      client.hgetall('storages', (err, reply) => res(reply));
    });
    const getPickPoints = new Promise((res, rej) => {
      client.hgetall('pickPoints', (err, reply) => res(reply));
    });
    Promise.all([getStorages, getPickPoints]).then(data => {
      res({ storages: data[0], pickPoints: data[1] });
    });
  });
};

const getStorageAddress = id =>
  new Promise((res, rej) => client.hget('storage', id, (err, reply) => (err ? rej(err) : res(reply))));

const getPickPointAddress = id =>
  new Promise((res, rej) => client.get('pickPoints', id, (err, reply) => (err ? rej(err) : res(reply))));

module.exports = {
  setAddresses,
  dump,
  getAddresses,
  getStorageAddress,
  getPickPointAddress
};
