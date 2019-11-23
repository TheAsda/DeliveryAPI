const neo4j = require('neo4j-driver').v1;

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
        const relation = calculateDistance(storID, pickID);
        console.log(relation);
        session.run(
          `match (s:Storage),(p:PickPoint) where s.id=${storID} and p.id=${pickID} create (s)-[w:Way{time:${relation.time},distance:${relation.dist}}]->(p)`
        );
        session.run(
          `match (s:Storage),(p:PickPoint) where s.id=${storID} and p.id=${pickID} create (s)<-[w:Way{time:${relation.time},distance:${relation.dist}}]-(p)`
        );
      }
    }
  }
  for (let i = 0; i < storageIDs.length; i++) {
    for (let j = i + 1; j < storageIDs.length; j++) {
      const relation = calculateDistance(storageIDs[i], storageIDs[j]);
      session.run(
        `match (a:Storage),(b:Storage) where a.id = ${storageIDs[i]} and b.id = ${storageIDs[j]} create (a)-[w:Way{time:${relation.time},distance:${relation.dist}}]->(b)`
      );
      session.run(
        `match (a:Storage),(b:Storage) where a.id = ${storageIDs[i]} and b.id = ${storageIDs[j]} create (a)<-[w:Way{time:${relation.time},distance:${relation.dist}}]-(b)`
      );
    }
  }
};

const findPath=async (from,to)=>{
  //match (start:PickPoint{id:1}), (end:PickPoint{id:3}) call apoc.algo.dijkstra(start,end,'Way','distance') yield path as path return path
  
}

const clearDB = () => {
  session.run('MATCH (n) DETACH DELETE n');
};

function calculateDistance(from, to) {
  const distances = {
    1: {
      2: {
        time: 6,
        dist: 2.3
      }
    },
    2: {
      4: {
        time: 68,
        dist: 46
      },
      5: {
        time: 405,
        dist: 700
      },
      6: {
        time: 867,
        dist: 1400
      },
      7: {
        time: 655,
        dist: 820
      }
    },
    3: {
      4: {
        time: 10,
        dist: 3.6
      }
    },
    4: {
      5: {
        time: 416,
        dist: 710
      },
      6: {
        time: 854,
        dist: 1300
      },
      7: {
        time: 682,
        dist: 860
      }
    },
    5: {
      6: {
        time: 1304,
        dist: 2000
      },
      7: {
        time: 1050,
        dist: 1500
      }
    },
    6: {
      7: {
        time: 1241,
        dist: 1800
      }
    }
  };

  if (to < from) {
    let t = from;
    from = to;
    to = t;
  }

  return distances[Number(from)][Number(to)];
}

module.exports = {
  buildGraph
};
