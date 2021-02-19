const https = require('https');

const url = 'https://valencefr.publicbikesystem.net/ube/gbfs/v1/en/station_status';

const stations = {};

const date = () => new Date().toLocaleString();

console.log('SmartUpdater running', date());

let lastUpdate = 0;

setInterval(() => {
  https.get(url, (res) => {
    let rs = '';

    res.on('data', (d) => rs += d);
    res.on('close', () => {
      rs = JSON.parse(rs);

      if (lastUpdate >= rs.last_updated) return;
      lastUpdate = rs.last_updated;

      const data = JSON.stringify({ cookie: res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ') });

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
          https.request('https://libelostats.usp-3.fr/update/', {
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
}, 1000);
