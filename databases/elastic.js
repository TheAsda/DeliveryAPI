const { Client } = require('@elastic/elasticsearch');
const client = new Client({ node: 'http://172.19.0.6:9200' });

const clear = () => {
  client.indices.delete({
    index: '_all'
  });
};

const log = (type, msg) => {
  client.index({
    index: type,
    body: {
      msg: msg,
      insertion: new Date(Date.now()).toDateString()
    }
  });
};

const getPaidByDate = date => {
  return new Promise((res, rej) => {
    const str = new Date(date).toDateString();
    console.log('Date: ' + str);

    client
      .search({
        index: 'payment',
        body: {
          query: { query_string: { query: str, default_operator: 'AND' } }
        }
      })
      .then(({ body }) => {
        res(body.hits.hits);
      });
  });
};

module.exports = {
  log,
  getPaidByDate
};
