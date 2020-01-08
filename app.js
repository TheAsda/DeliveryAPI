const express = require('express');
const {
  init,
  redis,
  neo4j,
  mongo,
  log,
  addPoint,
  deletePoint,
  elastic,
  postgres
} = require('./middleware');
const cors = require('cors');

init();

const app = express();

app.use(cors());
app.use(express.json());

app.post('/newOrder', async (req, res) => {
  const { sender, consignee, from, to, package } = req.body;

  if (!(await redis.getAddress(from))) {
    log('error', "No such 'from' address");
    res.send("No such 'from' address");
    return;
  }

  if (!(await redis.getAddress(to))) {
    log('error', "No such 'to' address");
    res.send("No such 'to' address");
    return;
  }

  let senderID = await mongo.clients.findOne(
    { passport: sender.passport },
    { _id: 1 }
  );

  if (!senderID) {
    log('warning', 'No such client, adding a new one');
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
    log('warning', 'No such client, adding a new one');
    await new mongo.clients(consignee).save().then(doc => {
      consigneeID = doc._id;
    });
  } else {
    consigneeID = consigneeID._id;
  }

  let packageID = await new mongo.packages(package).save().then(doc => doc._id);
  console.log(packageID);
  const orderID = await new mongo.orders({
    adoption_date: Date.now(),
    receive_date: null,
    sender: senderID,
    consignee: consigneeID,
    from: from,
    to: to,
    package: packageID,
    status: 'received',
    paid: false
  })
    .save()
    .then(doc => doc._id);

  log('new_order', `Placed new order with id {${orderID}}`);

  res.send(orderID);
});

app.post('/closeOrder', async (req, res) => {
  const { orderID } = req.body;

  const order = await mongo.orders.findOne({ _id: orderID });

  if (order.status === 'closed') {
    res.send({ error: 'Order is already closed' });
    return;
  }

  if (order.paid === false) {
    res.send({ error: 'Order has not been paid' });
    return;
  }

  mongo.orders.findByIdAndUpdate(
    { _id: orderID },
    { receive_date: Date.now(), status: 'closed' },
    { new: true }
  );

  log('close_order', `Order with id {${orderID}} has been closed`);

  res.sendStatus(200);
});

app.post('/pay', (req, res) => {
  const { orderID } = req.body;

  mongo.orders
    .findByIdAndUpdate({ _id: orderID }, { paid: true }, { new: true })
    .then(doc => {
      console.log(doc);
    });

  log('payment', `Order with id {${orderID}} has been payed`);

  res.sendStatus(200);
});

app.get('/pickPoints', async (req, res) => {
  log('info', 'Getting points');
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

app.post('/addPoint', (req, res) => {
  const { address } = req.body;
  addPoint(address);
  res.sendStatus(200);
});

app.post('/deletePoint', (req, res) => {
  log('info', 'Deleting point');

  const { id } = req.body;

  deletePoint(id);

  res.sendStatus(200);
});

app.post('/getPaid', async (req, res) => {
  const { district, date } = req.body;

  const ids = await elastic.getPaidByDate(date).then(values => {
    return values.map(str => {
      const id = str._source.msg.match(/{\S+}/)[0];
      return id.replace(/[\{\}]/g, '');
    });
  });
  console.log('Orders from elastic Count: ' + ids.length);

  let temp = [];
  const orders = [];
  for (let id of ids) {
    if (temp[id] !== 1) {
      temp[id] = 1;
    } else {
      continue;
    }
    const data = await mongo.orders.findById({ _id: id });
    if (data !== null) orders.push(data);
  }
  console.log('Orders from mongo Count: ' + orders.length);

  const districtIds = await postgres.getAddressesByDistrict(district);
  console.log('District ids from postgre Count: ' + districtIds.length);

  const districtOrders = orders.filter(order =>
    districtIds.includes(Number(order.from))
  );
  console.log('Filtered district orders Count: ' + districtOrders.length);

  const result = districtOrders.map(order => ({
    data: order,
    path: [],
    consignee: {},
    sender: {},
    package: {}
  }));
  for (let order of result) {
    order.path = await neo4j.findPath(order.data.from, order.data.to);
    order.sender = (
      await mongo.clients.findById({ _id: order.data.sender })
    ).toObject();
    order.consignee = (
      await mongo.clients.findById({
        _id: order.data.consignee
      })
    ).toObject();
    order.package = (
      await mongo.packages.findById({ _id: order.data.package })
    ).toObject();
  }
  console.log('Paths from neo4j and addresses from redis');

  res.send(result);
});

app.get('/orders', async (req, res) => {
  const orders = [];

  for (const order of await mongo.orders.find()) {
    let item = {
      id: order.id,
      paid: order.paid,
      status: order.status,
      package: {},
      full_info: order
    };
    const title = await mongo.packages.findById({ _id: order.package });
    item.package = title;
    orders.push(item);
  }

  res.send(orders);
});

app.get('/districts', async (req, res) => {
  res.send(await postgres.getDistricts());
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
