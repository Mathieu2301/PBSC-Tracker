const https = require('https');

const url = 'https://valencefr.publicbikesystem.net/ube/gbfs/v1/en/station_status';

const stations = {};

const date = () => new Date().toLocaleString();

console.log('AutoUpdater running', date());

setInterval(() => {
  https.get(url, (res) => {
    let rs = '';
    res.on('data', (d) => rs += d);
    res.on('close', () => {
      rs = JSON.parse(rs);

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
          https.get('https://libelostats.usp-3.fr/update/');
          stations[s.station_id] = newS;
        }
      });
    });
  }).end();
}, 2000);
