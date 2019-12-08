const redis = require('redis');
const client = redis.createClient();

client.on('error');

const clear = () => {
  client.flushall();
};

const setAddresses = data => {
  data.storages.forEach(storage => {
    client.hset('storages', storage.id, storage.address);
  });

  data.pickPoints.forEach(pickPoint => {
    client.hset('pickPoints', pickPoint.id, pickPoint.address);
  });
};

const dump = () => {
  client.SAVE();
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
  new Promise((res, rej) =>
    client.hget('storages', id, (err, reply) => (err ? rej(err) : res(reply)))
  );

const getPickPointAddress = id =>
  new Promise((res, rej) =>
    client.hget('pickPoints', id, (err, reply) => (err ? rej(err) : res(reply)))
  );

const getAddress = id =>
  new Promise((res, rej) => {
    getStorageAddress(id).then(data => {
      if (data === null) {
        getPickPointAddress(id).then(data => res(data));
      } else {
        res(data);
      }
    });
  });

module.exports = {
  setAddresses,
  dump,
  getAddresses,
  getStorageAddress,
  getPickPointAddress,
  getAddress,
  clear
};
