const fetch = require('node-fetch');

const getLatLon = address => {
  return new Promise((res, rej) => {
    fetch(
      `https://geocoder.api.here.com/6.2/geocode.json?app_id=GiJ0fdprQ8xTIWag6aEp&app_code=3sxT725UJQAD_aB72xmMbg&searchtext=${address}`
    )
      .then(res => res.json())
      .then(data => {
        res(data.Response.View[0].Result[0].Location.DisplayPosition);
      });
  });
};

const getDistance = async addresses => {
  const coordinates = [];
  for (let i = 0; i < 2; i++) {
    coordinates.push(
      await getLatLon(addresses[i].replace(' ', '+').replace(/,\./, ''))
    );
  }
  return new Promise((res, rej) => {
    fetch(
      `https://route.api.here.com/routing/7.2/calculateroute.json?app_id=GiJ0fdprQ8xTIWag6aEp&app_code=3sxT725UJQAD_aB72xmMbg&waypoint0=geo!${coordinates[0].Latitude},${coordinates[0].Longitude}&waypoint1=geo!${coordinates[1].Latitude},${coordinates[1].Longitude}&mode=fastest;car;traffic:disabled`
    )
      .then(res => res.json())
      .then(data => {
        res({
          distance: data.response.route[0].summary.distance / 1000,
          time: data.response.route[0].summary.travelTime / 60
        });
      });
  });
};

module.exports = {
  getDistance
};
