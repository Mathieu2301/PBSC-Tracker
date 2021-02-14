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

function distBetween(s1, s2) {
  return Math.acos(
    Math.sin(s1.lat * (Math.PI / 180))
    * Math.sin(s2.lat * (Math.PI / 180))
    + Math.cos(s1.lat * (Math.PI / 180))
    * Math.cos(s2.lat * (Math.PI / 180))
    * Math.cos((s1.lon - s2.lon) * (Math.PI / 180)),
  ) * 6371000;
}

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
            [s.lat, s.lon],
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
        const traveled = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);

        if (traveled > 0 && traveled <= window.config.maxDistance) a.setRadius(traveled);
        else {
          a.remove();
          delete this.areas[i];
        }
      });

      this.logs.forEach((log) => {
        const dockTimestamp = new Date(log.time).getTime();
        const dockTraveled = window.config.distanceCalc(dockTimestamp, this.nowTime);

        const s = this.stations[log.sID];
        const logUID = `${log.sID}_${log.time}`;

        if (log.diff < 0 && dockTraveled <= window.config.maxDistance) {
          if (!this.areas[logUID]) {
            this.areas[logUID] = L.circle(
              [s.lat, s.lon], {
                color: (log.type === 'E' ? '#0080ff' : '#8d00c9'),
                fillColor: '#f030000',
                fillOpacity: 0.1,
                radius: dockTraveled,
              },
            ).addTo(this.map);
          }
        } else if (log.diff > 0 && !this.lines[logUID]) {
          const paths = [];
          this.logs.forEach((startLog) => {
            const startTimestamp = new Date(startLog.time).getTime();
            const timeDistance = window.config.distanceCalc(startTimestamp, dockTimestamp);

            if (
              startLog.diff > 0
              || startTimestamp > dockTimestamp
              || timeDistance > window.config.maxDistance
              || startLog.type !== log.type
            ) return;

            const startS = this.stations[startLog.sID];
            const realDistance = distBetween(startS, s);

            const prob = Math.round((1 - (
              (Math.abs(timeDistance - realDistance) / Math.max(timeDistance, realDistance))
              * ((Math.abs(timeDistance - realDistance) ** 1.1) / (realDistance + 1))
            )) * 10 ** 4) / (10 ** 4);

            if (prob < window.config.minProb) return;

            const timeS = Math.round((dockTimestamp - startTimestamp) / 1000);

            paths.push({
              startSID: startLog.sID,
              startS: startLog.sName,
              startTime: startLog.time,
              startPos: [startS.lat, startS.lon],
              dockS: log.sName,
              dockTime: log.time,
              timeDistance,
              realDistance,
              dockTimestamp,
              startTimestamp,
              diff: dockTimestamp - startTimestamp,
              time: `${Math.floor(timeS / 60)}:${window.addZeros(timeS % 60)}`,
              prob,
            });
          });

          console.log(
            'Paths for', logUID,
            '=>', paths.sort((a, b) => (a.prob < b.prob ? 1 : -1)),
          );

          if (paths.length === 0) {
            this.lines[logUID] = 'bypass';
            return;
          }

          paths.sort((a, b) => (a.prob < b.prob ? 1 : -1)).forEach((path, i) => {
            if (i + 1 > window.config.maxResults) return;
            const opacity = Math.round(
              (path.prob - window.config.minProb) * (255 / (1 - window.config.minProb)),
            ).toString(16);

            this.lines[logUID] = L.polyline(
              [
                path.startPos,
                [s.lat, s.lon],
              ], {
                color: (log.type === 'E' ? `#0080ff${opacity}` : `#8d00c9${opacity}`),
                weight: 3,
              },
            ).addTo(this.map);

            this.lines[logUID].bindPopup(`
              From: ${path.startS} (${path.startTime.split(' ')[1]})<br>
              To: ${path.dockS} (${path.dockTime.split(' ')[1]})<br>
              Time: ${path.time}<br>
              Prob: ${path.prob * 100} %<br>
            `);
          });
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
