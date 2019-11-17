const neo4j = require('neo4j-driver').v1;
// Create a driver instance, for the user neo4j with password neo4j.
// It should be enough to have a single driver per database per application.
var driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "test"));

// Create a session to run Cypher statements in.
// Note: Always make sure to close sessions when you are done using them!
var session = driver.session();

// the Promise way, where the complete result is collected before we act on it:
session
  .run('MERGE (james:Person {name : {nameParam} }) RETURN james.name AS name', {nameParam: 'James'})
  .then(function (result) {
    result.records.forEach(function (record) {
      console.log(record.get('name'));
    });
    session.close();
    driver.close();
  })
  .catch(function (error) {
    console.log(error);
  });

// Close the driver when application exits.
// This closes all used network connections.
