import { createApp } from 'vue';
import app from './app.vue';
import api from './api';

window.api = api;

window.config = {
  server: (
    process.env.NODE_ENV !== 'development'
      ? 'https://libelostats.apis.colmon.fr'
      : 'http://localhost:3000'
  ),
  mapCenter: [44.93, 4.9], // Valence

  distanceCalc: (time, start) => Math.round(((start - time) / 1000) * (250 / 60)),
  bikeAvgSpeed: 20,
};

window.addZeros = (i) => (parseInt(i, 10) < 10 ? `0${i}` : i);

(async () => {
  window.paths = await window.api.getPaths();
  window.stations = await window.api.getStations();

  createApp(app).mount('#app');
})();
