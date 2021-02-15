import $ from './request';

let handler = () => {};

let lastID = 0;

async function fetch() {
  const newLastID = (await $('lastFetch')).lastID;
  if (newLastID !== lastID) {
    handler(await $('getData'));
    lastID = newLastID;
  }
}

setInterval(fetch, 1000);

export default {
  fetch,

  onFetch(cb) {
    handler = cb;
    fetch();
  },

  getStations: () => $('getStations', 'stations'),
  getPaths: () => $('getPaths', 'paths'),
};
