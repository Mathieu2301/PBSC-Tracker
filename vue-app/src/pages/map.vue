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
  blue: L.icon({
    iconUrl: './icon_blue.png',
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
    stationMarkers: null,
    map: null,
    savedCenter: null,

    areas: {},
    lines: {},
  }),

  methods: {
    initStations() {
      if (this.selectedStart) return;

      if (!this.stationMarkers) this.initStationMarkers();

      Object.keys(this.stationsBikes).forEach((sID) => {
        if (this.stationMarkers[sID]) {
          const s = this.stations[sID];
          const [mB, eB] = this.stationsBikes[sID];

          let iName = 'grey';
          if (mB) iName = 'purple';
          if (eB) iName = 'green';

          this.stationMarkers[sID].marker.setIcon(icons[iName]);
          this.stationMarkers[sID].popup.setContent(`
            <b>${s.name}</b>
            <br>Mech: ${mB}
            <br>Elec: ${eB}
            <br>
            <br>Bikes: ${eB + mB}
            <br>Docks: ${s.cap}
          `);
        }
      });
    },

    initStationMarkers() {
      this.stationMarkers = {};

      Object.keys(this.stations).forEach((i) => {
        const s = this.stations[i];

        if (!this.stationMarkers[i]) {
          this.stationMarkers[i] = {
            marker: L.marker(
              [s.lat, s.lon],
              { icon: icons.purple },
            ).addTo(this.map),
            popup: L.popup().setContent(`<b>${s.name}</b>`),
          };
          this.stationMarkers[i].marker.bindPopup(this.stationMarkers[i].popup);
        }
      });
    },

    drawZones() {
      if (this.selectedStart) return;
      Object.keys(this.starts).filter((tID) => (
        !this.starts[tID].results
        && this.nowTime - new Date(this.starts[tID].time).getTime() < 1800000
        && this.nowTime - new Date(this.starts[tID].time).getTime() > 0
      )).forEach((tID) => {
        const t = this.starts[tID];
        const s = this.stations[t.sID];

        const dockTraveled = window.config.distanceCalc(new Date(t.time).getTime(), this.nowTime);

        if (!this.areas[tID]) {
          this.areas[tID] = L.circle(
            [s.lat, s.lon], {
              fillColor: (t.type === 'E' ? '#0080ff' : '#8d00c9'),
              fillOpacity: 0.1,
              radius: dockTraveled,
              weight: 0,
            },
          ).addTo(this.map);
        } else {
          this.areas[tID].setRadius(dockTraveled);
        }

        this.areas[tID].bindPopup(`
          From: ${s.name}<br>
          Start: ${t.time}<br>
          Time: ${this.formatTime((this.nowTime - new Date(t.time).getTime()) / 1000)}<br>
          Radius: ${dockTraveled} m<br>
        `);
      });

      this.hideZones((tID) => (
        this.starts[tID].results
        || this.nowTime - new Date(this.starts[tID].time).getTime() < 0
        || this.nowTime - new Date(this.starts[tID].time).getTime() > 1800000
      ));
    },

    hideZones(filter = () => true) {
      Object.keys(this.areas).filter(filter).forEach((tID) => {
        this.areas[tID].remove();
        delete this.areas[tID];
      });
    },

    formatTime(sec) {
      return (sec < 3600)
        ? `${Math.floor(sec / 60)}:${window.addZeros(Math.round(sec) % 60)} s`
        : `${Math.floor(sec / 3600)}h${window.addZeros(Math.round((sec / 60) % 60))}`;
    },
  },

  watch: {
    nowTime() {
      this.drawZones();
    },

    starts() {
      this.drawZones();
    },

    stationsBikes() {
      this.initStations();
    },

    selectedStart() {
      if (this.selectedStart) {
        const station = this.stations[this.starts[this.selectedStart].sID];
        if (!this.savedCenter) this.savedCenter = [this.map.getCenter(), this.map.getZoom()];
        const bounds = [];
        const start = this.starts[this.selectedStart];

        Object.keys(start.ends).forEach((endID) => {
          const endS = this.stations[start.ends[endID].sID];
          bounds.push([endS.lat, endS.lon]);
        });

        this.map.fitBounds([
          [station.lat, station.lon],
          ...bounds,
        ]);
        this.hideZones();
      } else {
        this.drawZones();
        if (this.savedCenter) this.map.setView(...this.savedCenter);
        this.savedCenter = null;
      }

      Object.keys(this.lines).forEach((lID) => {
        this.lines[lID].remove();
        delete this.lines[lID];
      });

      Object.keys(this.stationMarkers).forEach((sID) => {
        this.stationMarkers[sID].marker.setIcon(icons.grey);
        this.stationMarkers[sID].popup.setContent(`<b>${this.stations[sID].name}</b>`);
      });

      if (this.selectedStart && this.starts[this.selectedStart]) {
        const start = this.starts[this.selectedStart];
        const startS = this.stations[start.sID];

        this.stationMarkers[start.sID].marker.setIcon(icons.blue);

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

          if (end.sID !== start.sID) this.stationMarkers[end.sID].marker.setIcon(icons.purple);
          this.stationMarkers[end.sID].popup.setContent(`
            <b>${endS.name}</b><br>
            Time: ${this.formatTime(end.time)}<br>
            Distance: ${end.realDistance} m (${this.formatTime(end.realDuration)})<br>
            Speed: ${end.speed} km/h<br>
            Prob: ${end.percent} %<br>
          `);
        });
      } else this.initStations();
    },

    stations() {
      this.initStationMarkers();
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
