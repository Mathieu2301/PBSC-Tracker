import $ from './request';

let handler = () => {};

async function fetch() {
  handler(await $('getLogs'));
}

setInterval(fetch, 10000);

export default {
  fetch,

  onFetch(cb) {
    handler = cb;
    fetch();
  },

  getStations: () => $('getStations'),
};
