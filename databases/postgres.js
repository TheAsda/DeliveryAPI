const { Pool } = require('pg');

const pool = new Pool({
  user: 'yourusername',
  host: require('./ips/ips').postgres,
  database: 'testdb',
  password: 'yoursecurepassword',
  port: 5432
});

const getAddresses = () => {
  return new Promise((res, rej) => {
    pool.query(
      'select single, houses.id,houses.number as house,streets.name as street,districts.name as district,cities.name as city,houses.type from houses left join streets on street = streets.id left join districts on district = districts.id left join cities on city = cities.id',
      (err, data) => {
        const storages = [];
        const pickPoints = [];
        if (!data || !data.rows) {
          return;
        }
        data.rows.forEach(row => {
          const str = `${row.city}, ${row.street}, ${row.house}`;
          if (row.type) {
            storages.push({
              id: row.id,
              address: str,
              district: row.district
            });
          } else {
            pickPoints.push({
              id: row.id,
              address: str,
              district: row.district
            });
          }
        });
        res({
          storages,
          pickPoints
        });
      }
    );
  });
};

const getAddressesByDistricts = () => {
  return new Promise((res, rej) => {
    pool.query(
      'select single, houses.id,houses.number as house,streets.name as street,districts.name as district,cities.name as city,houses.type from houses left join streets on street = streets.id left join districts on district = districts.id left join cities on city = cities.id',
      (err, data) => {
        let cities = [];
        if (!data || !data.rows) {
          return;
        }
        data.rows.forEach(item => {
          if (!cities[item.city]) {
            cities[item.city] = [];
          }
          if (!cities[item.city][item.district]) {
            cities[item.city][item.district] = {
              storage: undefined,
              pickPoints: []
            };
          }
          if (item.type) {
            cities[item.city][item.district].storage = {
              id: item.id
            };
          } else {
            cities[item.city][item.district].pickPoints.push({ id: item.id });
          }
        });
        res(cities);
      }
    );
  });
};

const getDistricts = () => {
  return new Promise((res, rej) => {
    pool.query('select name from districts', (err, data) => {
      let districts = [];
      if (!data || !data.rows) {
        return;
      }
      data.rows.forEach(item => {
        districts.push(item.name);
      });
      res(districts);
    });
  });
};

const addPoint = ({ city, district, street, house }) => {
  return new Promise((res, rej) => {
    pool.query(
      `select add_point('${city}','${district}','${street}','${house}')`,
      (err, data) => {
        res();
      }
    );
  });
};

const deletePoint = id => {
  return new Promise((res, rej) => {
    pool.query(`delete from houses where id = ${id}`, (err, data) => {
      res();
    });
  });
};

const getAddressesByDistrict = district => {
  return new Promise((res, rej) => {
    pool.query(
      `select houses.id from houses left join streets on street = streets.id left join districts on district = districts.id left join cities on city = cities.id where districts.name = '${district}'`,
      (err, data) => {
        const result = [];
        if (!data || !data.rows) {
          return;
        }
        data.rows.forEach(row => {
          result.push(row.id);
        });
        res(result);
      }
    );
  });
};

module.exports = {
  getAddresses,
  getAddressesByDistrict,
  addPoint,
  deletePoint,
  getDistricts
};
