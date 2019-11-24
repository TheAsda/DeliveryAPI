const neo4j = require('neo4j-driver').v1;
const { getDistance } = require('./here_api');
const { getAddress } = require('./redis');

var driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'test')
);

var session = driver.session();

const buildGraph = async data => {
  clearDB();
  const storageIDs = [];
  for (let city in data) {
    for (let district in data[city]) {
      const storID = data[city][district].storage.id;
      storageIDs.push(storID);
      session.run(`create (s:Storage{id:${storID}})`);
      for (let pickPoint of data[city][district].pickPoints) {
        const pickID = pickPoint.id;
        session.run(`create (p:PickPoint{id:${pickID}})`);
        const relation = await calculateDistance(storID, pickID);
        session.run(
          `match (s:Storage),(p:PickPoint) where s.id=${storID} and p.id=${pickID} create (s)-[w:Way{time:${relation.time},distance:${relation.distance}}]->(p)`
        );
        session.run(
          `match (s:Storage),(p:PickPoint) where s.id=${storID} and p.id=${pickID} create (s)<-[w:Way{time:${relation.time},distance:${relation.distance}}]-(p)`
        );
      }
    }
  }
  for (let i = 0; i < storageIDs.length; i++) {
    for (let j = i + 1; j < storageIDs.length; j++) {
      const relation = await calculateDistance(storageIDs[i], storageIDs[j]);
      session.run(
        `match (a:Storage),(b:Storage) where a.id = ${storageIDs[i]} and b.id = ${storageIDs[j]} create (a)-[w:Way{time:${relation.time},distance:${relation.distance}}]->(b)`
      );
      session.run(
        `match (a:Storage),(b:Storage) where a.id = ${storageIDs[i]} and b.id = ${storageIDs[j]} create (a)<-[w:Way{time:${relation.time},distance:${relation.distance}}]-(b)`
      );
    }
  }
};

const findPath = (from, to) => {
  return new Promise((res, rej) => {
    let result = {
      totalDistance: 0,
      totalTime: 0,
      path: []
    };
    //match (start:PickPoint{id:1}), (end:PickPoint{id:3}) call apoc.algo.dijkstra(start,end,'Way','distance') yield path as path return path
    session
      .run(
        `match (start{id:${from}}), (end{id:${to}}) call apoc.algo.dijkstra(start,end,'Way','distance') yield path as path return path`
      )
      .then(data => {
        if (!data.records[0]) {
          rej('No such path');
          return;
        }

        const path = data.records[0].get(0);
        for (let item of path.segments) {
          let dist = item.relationship.properties.distance;
          if (typeof dist === 'object') {
            dist = dist.low;
          }
          result.totalDistance += dist;

          let time = item.relationship.properties.time;
          if (typeof time === 'object') {
            time = time.low;
          }
          result.totalTime += time;

          if (!result.path.includes(item.start.properties.id.low)) {
            result.path.push(item.start.properties.id.low);
          }
          if (!result.path.includes(item.end.properties.id.low)) {
            result.path.push(item.end.properties.id.low);
          }
        }
        res(result);
      });
  });
};

const clearDB = () => {
  session.run('MATCH (n) DETACH DELETE n');
};

function calculateDistance(from, to) {
  return new Promise((res, rej) => {
    Promise.all([getAddress(from), getAddress(to)]).then(data => {
      getDistance(data).then(data => res(data));
    });
  });
}

module.exports = {
  buildGraph,
  findPath,
  calculateDistance
};
