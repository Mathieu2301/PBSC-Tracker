import { createApp } from 'vue';
import app from './app.vue';
import api from './api';

window.api = api;

window.config = {
  server: 'libelostats.usp-3.fr',
  mapCenter: [44.9307, 4.8944], // Valence

  distanceCalc: (time, start) => Math.round(((start - time) / 1000) * (250 / 60)),
  maxDistance: 10000,
};

createApp(app).mount('#app');
