const redis = require('redis');
const { log } = require('./elastic');
const client = redis.createClient();

client.on('error', function(err) {
  log('error', 'Error ' + err);
});

const clear = () => {
  client.flushall(() => {
    log('info', 'Redis cleared');
  });
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
  client.SAVE((err, reply) => {
    log('info', 'Redis dumped');
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
      log('debug', 'Getting all addresses from redis');
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
    log('debug', `Getting address with id{${id}} from redis`);
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
