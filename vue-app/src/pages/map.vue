<template>
  <div>
    <div id="map"/>
  </div>
</template>

<script>
import L from 'leaflet';

const icons = {
  purple: L.icon({
    iconUrl: './icon.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  }),
  green: L.icon({
    iconUrl: './icon_green.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  }),
  grey: L.icon({
    iconUrl: './icon_grey.png',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  }),
};

// function distBetween(s1ID, s2ID) {
//   if (s1ID === s2ID) return 0;
//   const path = window.paths[`${s1ID}>${s2ID}`];
//   return (path) ? path[0] : 0;
// }

export default {
  name: 'Map',
  props: {
    stations: Object,
    stationsBikes: Object,
    starts: Object,
    selectedStart: String,
    nowTime: Number,
  },

  data: () => ({
    stationList: null,
    map: null,

    areas: {},
    lines: {},
  }),

  methods: {
    initStations() {
      Object.keys(this.stationsBikes).forEach((sID) => {
        if (this.stationList[sID]) {
          const s = this.stations[sID];
          const [eB, mB] = this.stationsBikes[sID];

          let iName = 'grey';
          if (mB) iName = 'purple';
          if (eB) iName = 'green';

          this.stationList[sID].marker.setIcon(icons[iName]);
          this.stationList[sID].popup.setContent(`
            <b>${s.name}</b>
            <br>Elec: ${eB}
            <br>Mech: ${mB}
            <br>
            <br>Bikes: ${eB + mB}
            <br>Docks: ${s.cap}
          `);
        }
      });
    },

    formatTime(sec) {
      return (sec < 3600)
        ? `${Math.floor(sec / 60)}:${window.addZeros(sec % 60)} s`
        : `${Math.floor(sec / 3600)}h${window.addZeros(Math.round((sec / 60) % 60))}`;
    },
  },

  watch: {
    stationsBikes() {
      this.initStations();
    },

    starts() {
      console.log(this.starts);
    },

    selectedStart() {
      Object.keys(this.lines).forEach((lID) => {
        this.lines[lID].remove();
        delete this.lines[lID];
      });

      Object.keys(this.stationList).forEach((sID) => {
        this.stationList[sID].marker.setIcon(icons.grey);
        this.stationList[sID].popup.setContent(`<b>${this.stations[sID].name}</b>`);
      });

      if (this.selectedStart && this.starts[this.selectedStart]) {
        const start = this.starts[this.selectedStart];
        const startS = this.stations[start.sID];

        this.stationList[start.sID].marker.setIcon(icons.green);

        Object.values(start.ends).forEach((end) => {
          if (this.lines[end.UID]) return;
          const endS = this.stations[end.sID];

          const opacity = Math.round(end.prob * 255).toString(16);

          this.lines[end.UID] = L.polyline(
            [
              [startS.lat, startS.lon],
              [endS.lat, endS.lon],
            ], {
              color: (start.type === 'E' ? `#0080ff${opacity}` : `#8d00c9${opacity}`),
              weight: 3,
            },
          ).addTo(this.map);

          this.lines[end.UID].bindPopup(`
            From: ${startS.name}<br>
            To: ${endS.name}<br>
            Time: ${this.formatTime(end.time)}<br>
            Distance: ${end.realDistance} m (${this.formatTime(end.realDuration)})<br>
            Speed: ${end.speed} km/h<br>
            Prob: ${end.percent} %<br>
          `);

          if (end.sID !== start.sID) this.stationList[end.sID].marker.setIcon(icons.purple);
          this.stationList[end.sID].popup.setContent(`
            <b>${endS.name}</b><br>
            Time: ${this.formatTime(end.time)}<br>
            Distance: ${end.realDistance} m (${end.realDuration} min)<br>
            Speed: ${end.speed} km/h<br>
            Prob: ${end.percent} %<br>
          `);
        });
      } else this.initStations();
    },

    stations() {
      this.stationList = {};

      Object.keys(this.stations).forEach((i) => {
        const s = this.stations[i];

        if (!this.stationList[i]) {
          this.stationList[i] = {
            marker: L.marker(
              [s.lat, s.lon],
              { icon: icons.purple },
            ).addTo(this.map),
            popup: L.popup().setContent(`<b>${s.name}</b>`),
          };
          this.stationList[i].marker.bindPopup(this.stationList[i].popup);
        }
      });
    },

    logs() {
      console.log('Logs');
      // Object.keys(this.areas).forEach((i) => {
      //   const time = i.split('_')[1];
      //   const a = this.areas[i];
      //   const traveled = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);

      //   if (traveled > 0 && traveled <= window.config.maxDistance) a.setRadius(traveled);
      //   else {
      //     a.remove();
      //     delete this.areas[i];
      //   }
      // });

      // this.logs.forEach((log) => {
      //   const dockTimestamp = new Date(log.time).getTime();
      //   const dockTraveled = window.config.distanceCalc(dockTimestamp, this.nowTime);

      //   const s = this.stations[log.sID];
      //   const logUID = `${log.sID}_${log.time}`;

      //   if (log.diff < 0 && dockTraveled <= window.config.maxDistance) {
      //     if (!this.areas[logUID]) {
      //       this.areas[logUID] = L.circle(
      //         [s.lat, s.lon], {
      //           fillColor: (log.type === 'E' ? '#0080ff' : '#8d00c9'),
      //           fillOpacity: 0.2,
      //           radius: dockTraveled,
      //           weight: 0,
      //         },
      //       ).addTo(this.map);
      //     }
      //   } else if (log.diff > 0 && !this.lines[logUID]) {
      //     const paths = [];
      //     this.logs.forEach((startLog) => {
      //       const startTimestamp = new Date(startLog.time).getTime();
      //       const timeDistance = window.config.distanceCalc(startTimestamp, dockTimestamp);

      //       if (
      //         startLog.diff > 0
      //         || startTimestamp > dockTimestamp
      //         || timeDistance > window.config.maxDistance
      //         || startLog.type !== log.type
      //       ) return;

      //       const startS = this.stations[startLog.sID];
      //       const realDistance = distBetween(startLog.sID, log.sID);

      //       const prob = Math.round((1 - (
      //         (Math.abs(timeDistance - realDistance) / Math.max(timeDistance, realDistance))
      //         * ((Math.abs(timeDistance - realDistance) ** 1.1) / (realDistance + 1))
      //       )) * 10 ** 4) / (10 ** 4);

      //       if (prob < window.config.minProb) return;

      //       const timeS = Math.round((dockTimestamp - startTimestamp) / 1000);

      //       paths.push({
      //         startSID: startLog.sID,
      //         startS: startLog.sName,
      //         startTime: startLog.time,
      //         startPos: [startS.lat, startS.lon],
      //         dockS: log.sName,
      //         dockTime: log.time,
      //         timeDistance,
      //         realDistance,
      //         dockTimestamp,
      //         startTimestamp,
      //         diff: dockTimestamp - startTimestamp,
      //         time: `${Math.floor(timeS / 60)}:${window.addZeros(timeS % 60)}`,
      //         prob,
      //       });
      //     });

      //     // console.log(
      //     //   'Paths for', logUID,
      //     //   '=>', paths.sort((a, b) => (a.prob < b.prob ? 1 : -1)),
      //     // );

      //     if (paths.length === 0) {
      //       this.lines[logUID] = 'bypass';
      //       return;
      //     }

      //     paths.sort((a, b) => (a.prob < b.prob ? 1 : -1)).forEach((path, i) => {
      //       if (i + 1 > window.config.maxResults) return;
      //       const opacity = Math.round(
      //         (path.prob - window.config.minProb) * (255 / (1 - window.config.minProb)),
      //       ).toString(16);

      //       this.lines[logUID] = L.polyline(
      //         [
      //           path.startPos,
      //           [s.lat, s.lon],
      //         ], {
      //           color: (log.type === 'E' ? `#0080ff${opacity}` : `#8d00c9${opacity}`),
      //           weight: 3,
      //         },
      //       ).addTo(this.map);

      //       this.lines[logUID].bindPopup(`
      //         From: ${path.startS} (${path.startTime.split(' ')[1]})<br>
      //         To: ${path.dockS} (${path.dockTime.split(' ')[1]})<br>
      //         Time: ${path.time}<br>
      //         Prob: ${path.prob * 100} %<br>
      //       `);
      //     });
      //   }
      // });
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
