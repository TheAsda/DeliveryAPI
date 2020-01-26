const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const db = mongoose.connect(require('./ips/ips').mongo, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  user: 'user',
  pass: 'example'
});

const Order = new mongoose.Schema(
  {
    adoption_date: Date,
    receive_date: Date,
    sender: String,
    consignee: String,
    from: String,
    to: String,
    package: String,
    status: String,
    paid: Boolean
  },
  {
    versionKey: false
  }
);

const OrderModel = mongoose.model('orders', Order);

const Package = new mongoose.Schema(
  {
    title: String,
    description: String,
    weight: Number,
    dimentions: [Number, Number, Number]
  },
  {
    versionKey: false
  }
);

const PackageModel = mongoose.model('packages', Package);

const Client = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    phone: String,
    email: String,
    passport: String
  },
  {
    versionKey: false
  }
);

const ClientModel = mongoose.model('clients', Client);

module.exports = {
  orders: OrderModel,
  packages: PackageModel,
  clients: ClientModel
};
