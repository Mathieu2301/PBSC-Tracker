const https = require('https');
const fs = require('fs');

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Please specify city name and GMaps API key');
  console.log(`Like "node ${__filename.split('\\').pop()} Valence xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`);
  return;
}

const [ cityName, key ] = args;

function request(url) {
  return new Promise((cb) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (d) => data += d);
      res.on('close', () => {
        data = JSON.parse(data);
        if (data.error_message) {
          console.error('GMaps API error:', data.error_message);
          process.exit(1);
        }
        cb(data);
      });
    })
  });
}

const paths = {};

https.get('https://libelostats.usp-3.fr/getStations', (res) => {
  let stations = '';
  res.on('data', (d) => stations += d);
  res.on('close', async () => {
    stations = JSON.parse(stations);

    const sNumber = Object.keys(stations).length;
    console.log('Fetching', sNumber ** 2 - sNumber, 'paths');

    for (const s1ID in stations) {
      for (const s2ID in stations) {
        if (s1ID === s2ID) continue;
        const pathID = `${s1ID}>${s2ID}`;

        const origin = `${stations[s1ID].lat},${stations[s1ID].lon}`;
        const dest = `${stations[s2ID].lat},${stations[s2ID].lon}`;

        const wPath = await request(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=walking&key=${key}`);
        const bPath = await request(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=bicycling&key=${key}`);

        paths[pathID] = [ // => [walkDistance, walkTime, bikeDistance, bikeTime]
          wPath.routes[0].legs[0].distance.value,
          wPath.routes[0].legs[0].duration.value,
          bPath.routes[0].legs[0].distance.value,
          bPath.routes[0].legs[0].duration.value,
        ];

        console.log(`${pathID} =>`, paths[pathID]);
      }
    }

    fs.writeFile(`./${cityName}_paths.json`, JSON.stringify(paths), (err) => {
      if (err) console.error('FS error:', err.message);
      console.log('Wrote', Object.keys(require(`./${cityName}_paths.json`)).length, 'paths');
    });
  });
});
