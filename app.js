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
  const { sender, consignee, from, to, package, paid } = req.body;

  if (!(await redis.getAddress(from))) {
    res.send("No such 'from' address");
    return;
  }

  if (!(await redis.getAddress(to))) {
    res.send("No such 'to' address");
    return;
  }

  let senderID = await mongo.clients.findOne(
    { passport: sender.passport },
    { _id: 1 }
  );

  if (!senderID) {
    await new mongo.clients(sender).save().then(doc => {
      senderID = doc._id;
    });
  } else {
    senderID = senderID._id;
  }

  let consigneeID = await mongo.clients.findOne(
    { passport: consignee.passport },
    { _id: 1 }
  );

  if (!consigneeID) {
    await new mongo.clients(consignee).save().then(doc => {
      consigneeID = doc._id;
    });
  } else {
    consigneeID = consigneeID._id;
  }

  let packageID = await new mongo.packages(package).save().then(doc => doc._id);

  const orderID = await new mongo.orders({
    adoption_date: Date.now(),
    receive_date: null,
    sender: senderID,
    consignee: consigneeID,
    from: from,
    to: to,
    package: packageID,
    status: 'received',
    paid: paid
  })
    .save()
    .then(doc => doc._id);

  res.send(orderID);
});

app.post('/closeOrder', async (req, res) => {
  /*
   * orderID: string
   */

  const { orderID, paid } = req.body;

  const order = await mongo.orders.findOne({ _id: orderID });

  if (order.status === 'closed') {
    res.send({ error: 'Order is already closed' });
    return;
  }

  if (order.paid !== true) {
    if (paid === undefined && paid === false) {
      res.send({ error: 'Order has not been paid' });
      return;
    }
    mongo.orders
      .find(
        { _id: orderID },
        { receive_date: Date.now(), paid: true, status: 'closed' }
      )
      .then(doc => {
        console.log(doc);
      });
  } else {
    mongo.orders
      .findByIdAndUpdate(
        { _id: orderID },
        { receive_date: Date.now(), status: 'closed' }
      )
      .then(doc => {
        console.log(doc);
      });
  }

  res.sendStatus(200);
});

app.get('/pickPoints', async (req, res) => {
  const addresses = await redis.getAddresses();
  res.send(addresses.pickPoints);
});

app.post('/path', (req, res) => {
  const { from, to } = req.body;
  neo4j
    .findPath(Number(from), Number(to))
    .then(async data => {
      for (let i = 0; i < data.path.length; i++) {
        data.path[i] = await redis.getAddress(data.path[i]);
      }
      res.send(data);
    })
    .catch(error => {
      res.send({ error });
    });
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
