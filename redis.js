const redis = require('redis');
const client = redis.createClient();

// if you'd like to select database 3, instead of 0 (default), call
// client.select(3, function() { /* ... */ });

client.on('error', function(err) {
  console.log('Error ' + err);
});

client.set('string key', 'string val', redis.print);
client.get('string key', function(err, data) {
  console.log(data);
  client.quit();
});
