require('dotenv').config();
const https = require('https');

if (!process.env.TRACKER_API) {
  console.error('TRACKER_API not set');
  process.exit(1);
}

if (!process.env.CITY) {
  console.error('CITY not set');
  process.exit(1);
}

const requestLib = (
  process.env.TRACKER_API.startsWith('https')
    ? https
    : require('http')
);

const { TRACKER_API, CITY, UPDATE_INTERVAL } = process.env;
const stations = {};
const date = () => new Date().toLocaleString();

console.log('Using TRACKER_API:', TRACKER_API);
console.log('Using CITY:', CITY);
console.log('Using UPDATE_INTERVAL:', Number(UPDATE_INTERVAL) || 1000);
console.log('SmartUpdater running', date());

let lastUpdate = 0;

setInterval(() => {
  https.get(`https://${CITY}.publicbikesystem.net/ube/gbfs/v1/en/station_status`, (res) => {
    let rs = '';

    res.on('data', (d) => rs += d);
    res.on('close', () => {
      rs = JSON.parse(rs);

      if (lastUpdate >= rs.last_updated) return;
      lastUpdate = rs.last_updated;

      const data = JSON.stringify({ cookie: res.headers['set-cookie']?.map((c) => c.split(';')[0]).join('; ') });

      rs.data.stations.forEach((s) => {
        const newS = {
          e: s.num_bikes_available_types.ebike,
          m: s.num_bikes_available_types.mechanical,
        };

        if (!stations[s.station_id]) return stations[s.station_id] = newS;

        if (newS.e !== stations[s.station_id].e || newS.m !== stations[s.station_id].m) {
          console.log(`[${date()}]: Station ${s.station_id} =>`, {
            e: newS.e - stations[s.station_id].e,
            m: newS.m - stations[s.station_id].m,
          });
          requestLib.request(`${TRACKER_API}/update`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': data.length
            }
          }, (res) => {
            let r = '';

            res.on('data', (d) => r += d);
            res.on('close', () => {
              console.log(r);
            });
          }).end(data);

          stations[s.station_id] = newS;
        }
      });
    });
  }).end();
}, Number(process.env.UPDATE_INTERVAL) || 1000);
