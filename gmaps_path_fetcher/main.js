require('dotenv').config();
const https = require('https');
const fs = require('fs');

if (!process.env.TRACKER_API) {
  console.log('Please specify TRACKER_API env variable');
  process.exit(1);
}

if (!process.env.CITY) {
  console.log('Please specify CITY env variable');
  process.exit(1);
}

if (!process.env.GMAPS_API_KEY) {
  console.log('Please specify GMAPS_API_KEY env variable');
  process.exit(1);
}

const { TRACKER_API, CITY, GMAPS_API_KEY } = process.env;

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

const requestLib = (
  process.env.TRACKER_API.startsWith('https')
    ? https
    : require('http')
);

const pathsFileName = `./${CITY}_paths.json`;

const paths = (
  fs.existsSync(pathsFileName)
    ? JSON.parse(fs.readFileSync(pathsFileName))
    : {}
);

function savePaths() {
  fs.writeFile(pathsFileName, JSON.stringify(paths), (err) => {
    if (err) console.error('FS error:', err.message);
    console.log('Wrote', Object.keys(paths).length, 'paths');
  });
}

console.log('Using TRACKER_API:', TRACKER_API);
console.log('Using CITY:', CITY);
console.log('Using GMAPS_API_KEY:', GMAPS_API_KEY.replace(/./g, '*'));

if (Object.keys(paths).length) {
  console.log('Found', Object.keys(paths).length, 'saved paths in', pathsFileName);
}

requestLib.get(`${TRACKER_API}/getStations`, (res) => {
  let stations = '';
  res.on('data', (d) => stations += d);
  res.on('close', async () => {
    stations = JSON.parse(stations);
    console.log('Fetching paths for', Object.keys(stations).length, 'stations');

    const sNumber = Object.keys(stations).length;
    const totalPathsCount = sNumber ** 2 - sNumber;
    console.log('Fetching', totalPathsCount, 'paths');

    for (const s1ID in stations) {
      for (const s2ID in stations) {
        if (s1ID === s2ID) continue;
        if (!!paths[`${s1ID}>${s2ID}`]) {
          console.log(`${s1ID}>${s2ID} already saved`);
          continue;
        }

        const pathID = `${s1ID}>${s2ID}`;

        const origin = `${stations[s1ID].lat},${stations[s1ID].lon}`;
        const dest = `${stations[s2ID].lat},${stations[s2ID].lon}`;

        const wPath = await request(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=walking&key=${GMAPS_API_KEY}`);
        const bPath = await request(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${dest}&mode=bicycling&key=${GMAPS_API_KEY}`);

        paths[pathID] = [ // => [walkDistance, walkTime, bikeDistance, bikeTime]
          wPath.routes[0].legs[0].distance.value,
          wPath.routes[0].legs[0].duration.value,
          bPath.routes[0].legs[0].distance.value,
          bPath.routes[0].legs[0].duration.value,
        ];

        console.log(`${pathID} =>`, paths[pathID]);
      }

      savePaths();
    }

    const fetchedPathsCount = Object.keys(paths).length;
    if (fetchedPathsCount !== totalPathsCount) {
      console.error('Not all paths were fetched:', fetchedPathsCount, '/', totalPathsCount);
      process.exit(1);
    } else {
      console.log('All paths were fetched:', fetchedPathsCount, '/', totalPathsCount);
    }
  });
});
