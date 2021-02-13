<template>
  <div>
    <div id="map"/>
  </div>
</template>

<script>
import L from 'leaflet';

const icon = L.icon({
  iconUrl: './icon.png',

  iconSize: [24, 24], // size of the icon
  iconAnchor: [12, 12], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -12], // point from which the popup should open relative to the iconAnchor
});

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
    lines: {},
  }),

  watch: {
    stations() {
      this.stationList = {};

      Object.keys(this.stations).forEach((i) => {
        const s = this.stations[i];
        this.stationList[i] = {
          marker: L.marker(
            L.latLng(parseFloat(s.lat), parseFloat(s.lon)),
            { icon },
          ).addTo(this.map),
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
        const distance = window.config.distanceCalc(new Date(log.time).getTime(), this.nowTime);
        if (distance > window.config.maxDistance) return;

        const s = this.stations[log.sID];
        const logUID = `${log.sID}_${log.time}`;

        if (log.diff < 0) {
          if (!this.areas[logUID]) {
            this.areas[logUID] = L.circle(
              L.latLng(parseFloat(s.lat), parseFloat(s.lon)), {
                color: (log.type === 'E' ? '#0080ff' : '#8d00c9'),
                fillColor: '#f030000',
                fillOpacity: 0.1,
                radius: distance,
              },
            ).addTo(this.map);
          }
        } else if (!this.lines[logUID]) {
          this.lines[logUID] = true;
        }
      });
    },
  },

  mounted() {
    this.map = L.map('map').setView(window.config.mapCenter, 13);
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
    bottom: 20px;
  }
</style>
