const mongoose = require('mongoose');
const db = mongoose.connect('mongodb://localhost:27017/test', {
  useNewUrlParser: true,
  user: 'user',
  pass: 'example'
});

// var User = new mongoose.Schema({
//   first_name: String,
//   last_name: String
// });

// var UserModel = mongoose.model('User', User);

// var record = new UserModel();

// record.first_name = 'hello';
// record.last_name = 'world';

// record.save(function(err) {
//   UserModel.find({}, function(err, users) {
//     for (var i = 0, counter = users.length; i < counter; i++) {
//       var user = users[i];

//       console.log(
//         'User => _id: ' +
//           user._id +
//           ', first_name: ' +
//           user.first_name +
//           ', last_name: ' +
//           user.last_name
//       );
//     }
//   });
// });

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
