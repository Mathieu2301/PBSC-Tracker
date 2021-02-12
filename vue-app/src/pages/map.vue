<template>
  <div>
    <div id="map"/>
  </div>
</template>

<script>
import L from 'leaflet';

export default {
  name: 'Map',
  props: {
    stations: Object,
    logs: Object,
    nowTime: Number,
  },

  data: () => ({
    stationList: null,
    map: null,
    areas: {},
  }),

  watch: {
    stations() {
      this.stationList = {};

      Object.keys(this.stations).forEach((i) => {
        const s = this.stations[i];
        this.stationList[i] = {
          marker: L.marker(L.latLng(parseFloat(s.lat), parseFloat(s.lon))).addTo(this.map),
        };
        this.stationList[i].marker.bindPopup(`<b>${s.name}</b>`);
      });
    },

    logs() {
      Object.keys(this.areas).forEach((i) => {
        const time = i.split('_')[1];
        const a = this.areas[i];
        const distance = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);
        if (distance > 0 && distance <= window.config.maxDistance) a.setRadius(distance);
        else {
          a.remove();
          delete this.areas[i];
        }
      });

      this.logs.forEach((log) => {
        if (log.diff > 0) return;

        const distance = window.config.distanceCalc(new Date(log.time).getTime(), this.nowTime);
        if (distance > window.config.maxDistance) return;
        const s = this.stations[log.sID];
        const logUID = `${log.sID}_${log.time}`;

        if (!this.areas[logUID]) {
          this.areas[logUID] = L.circle(
            L.latLng(parseFloat(s.lat), parseFloat(s.lon)),
            {
              color: 'red',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: distance,
            },
          ).addTo(this.map);
        }
      });
    },
  },

  mounted() {
    this.map = L.map('map').setView(window.config.mapCenter, 16);
    L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
      maxZoom: 20,
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(this.map);
  },
};
</script>

<style scoped>
  #map {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
</style>
