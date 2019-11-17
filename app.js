const express = require('express');
const init = require('./init');

const { redis, neo4j, mongo, postgres, elastic } = init();

const app = express();

app.use(express.json());

app.post('/newOrder', async (req, res) => {
  /*
   * sender: mongo.client
   * consignee: mongo.client
   * from: id
   * to: id
   * package: mongo.package
   * paid: bool
   */

  if (await redis.getAddress(from)) {
    res.send("No such 'from' address");
  }

  if (await redis.getAddress(to)) {
    res.send("No such 'to' address");
  }

  const { sender, consignee, from, to, package, paid } = req.body;

  let senderID = await mongo.clients.findOne({ passport: sender.passport }, { _id: 1 });

  if (!senderID) {
    await new mongo.clients(sender).save().then(doc => {
      senderID = doc._id;
    });
  } else {
    senderID = senderID._id;
  }

  let consigneeID = await mongo.clients.findOne({ passport: consignee.passport }, { _id: 1 });

  if (!consigneeID) {
    await new mongo.clients(consignee).save().then(doc => {
      consigneeID = doc._id;
    });
  } else {
    consigneeID = consigneeID._id;
  }

  let packageID = await new mongo.packages(package).save().then(doc => doc._id);

  new mongo.orders({
    adoptionDate: Date.now(),
    receive_date: null,
    sender: senderID,
    consignee: consigneeID,
    from: from,
    to: to,
    package: packageID,
    status: 'received',
    paid: paid
  }).save();

  res.sendStatus(200);
});

app.listen(3000);
