import { createApp } from 'vue';
import app from './app.vue';
import api from './api';

window.api = api;

window.config = {
  server: 'libelostats.usp-3.fr',
  mapCenter: [44.92, 4.92], // Valence

  distanceCalc: (time, start) => Math.round(((start - time) / 1000) * (250 / 60)),
  maxDistance: 6000,
};

createApp(app).mount('#app');
