const { Pool } = require('pg');

const pool = new Pool({
  user: 'yourusername',
  host: 'localhost',
  database: 'testdb',
  password: 'yoursecurepassword',
  port: 5432
});

const getAddresses = () =>
  new Promise((res, rej) => {
    pool.query(
      'select single, houses.id,houses.number as house,streets.name as street,districts.name as district,cities.name as city,houses.type from houses left join streets on street = streets.id left join districts on district = districts.id left join cities on city = cities.id',
      (err, data) => {
        const storages = [];
        const pickPoints = [];
        data.rows.forEach(row => {
          const str = `${row.city}, ${row.street}, ${row.house}`;
          if (row.type) {
            storages.push({ id: row.id, address: str, district: row.district });
          } else {
            if (row.single) {
              storages.push({
                id: row.id,
                address: str,
                district: row.district
              });
            }
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

const getAddressesByDistrict = () =>
  new Promise((res, rej) => {
    pool.query(
      'select single, houses.id,houses.number as house,streets.name as street,districts.name as district,cities.name as city,houses.type from houses left join streets on street = streets.id left join districts on district = districts.id left join cities on city = cities.id',
      (err, data) => {
        let cities = [];
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
            if (item.single) {
              cities[item.city][item.district].storage = {
                id: item.id
              };
            } else {
              cities[item.city][item.district].pickPoints.push({ id: item.id });
            }
          }
        });
        res(cities);
      }
    );
  });

module.exports = {
  getAddresses,
  getAddressesByDistrict
};
