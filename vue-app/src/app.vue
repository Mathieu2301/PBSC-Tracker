<template>
  <div>
    <mapEl
      :nowTime="nowTime"
      :stations="stations"
      :stationsBikes="stationsBikes"
      :starts="starts"
      :selectedStart="selectedStart"
    />

    <sideBar
      :nowTime="nowTime"
      :starts="starts"
      :usedEnds="usedEnds"
      :selectedStart="selectedStart"
      :selectStart="selectStart"
    />

    <div class="bottomFixed">
      <input class="timeSlide" type="range" min="-120" max="0" v-model="timeControl">
    </div>
  </div>
</template>

<script>
import mapEl from './pages/map.vue';
import sideBar from './pages/sidebar.vue';

export default {
  name: 'VelibTrackerUI',
  components: {
    mapEl,
    sideBar,
  },

  data: () => ({
    stations: {},
    stationsBikes: {},
    logs: {},

    starts: {},
    selectedStart: '',
    usedEnds: {},

    timeControl: 0,
    nowTime: Date.now(),
  }),

  async mounted() {
    this.stations = await window.api.getStations();

    window.api.onFetch((data) => {
      this.logs = data.operations;
      this.stationsBikes = data.stations;
      this.computePaths();
    });

    setInterval(() => {
      this.nowTime = parseInt(Date.now() + (this.timeControl * 60 * 1000), 10);
    }, 300);
  },

  watch: {
    timeControl() {
      this.nowTime = parseInt(Date.now() + (this.timeControl * 60 * 1000), 10);
    },
  },

  methods: {
    selectStart(UID) {
      if (!this.starts[UID].results) {
        this.selectedStart = '';
        return;
      }
      this.selectedStart = (this.selectedStart !== UID) ? UID : '';
    },

    computePaths() {
      this.logs.filter((s) => s.diff < 0).forEach((start) => {
        if (!this.starts[start.UID]) {
          this.starts = {
            ...this.starts,
            [start.UID]: {
              sID: start.sID,
              sName: this.stations[start.sID].name,
              time: start.time,
              type: start.type,
              ends: {},
            },
          };
        }

        this.logs.filter((e) => (
          e.diff > 0
          && new Date(start.time).getTime() < new Date(e.time).getTime()
          && new Date(e.time).getTime() - new Date(start.time).getTime() < 2700000
          && e.type === start.type
        )).forEach((end) => {
          if (this.starts[start.UID].ends[end.sID]) return;
          const duration = (new Date(end.time).getTime() - new Date(start.time).getTime()) / 1000;
          const rP = window.paths[`${start.sID}>${end.sID}`] ?? [0, 0, 0, 0];

          let pathDistance = Math.round((rP[0] + rP[2]) / 2) ?? 0;
          let pathDuration = Math.round(rP[3] * (rP[0] / Math.max(rP[0], rP[2]))) ?? 0;
          let speed = (Math.round((pathDistance / duration) * 36) / 10) ?? 0;

          if (!Number.isFinite(pathDistance)) pathDistance = 0;
          if (!Number.isFinite(pathDuration)) pathDuration = 0;
          if (!Number.isFinite(speed)) speed = 0;

          if (speed > 30) return;

          let targetSpeed = window.config.bikeAvgSpeed;
          if (start.type === 'E') {
            pathDuration = Math.round(pathDuration * 0.9);
            targetSpeed = Math.round(targetSpeed * 1.1);
          }

          let prob = 1 - (Math.abs(targetSpeed - speed) / targetSpeed);

          if (duration < 15 && start.sID === end.sID) prob = 1;
          if (prob > 1) prob = 1;
          if (prob <= 0) return;

          if (!this.usedEnds[end.UID]) this.usedEnds[end.UID] = 0;
          this.usedEnds[end.UID] += prob;

          this.starts[start.UID].ends[end.sID] = {
            UID: end.UID,
            sID: end.sID,
            sName: this.stations[end.sID].name,
            time: duration,
            realDuration: pathDuration,
            realDistance: pathDistance,
            speed,
            prob,
            percent: Math.round(prob * 10000) / 100,
          };
          this.starts[start.UID].results = Object.keys(this.starts[start.UID].ends).length;
        });
      });
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Questrial&display=swap');

::placeholder { color: #ffffffc0 }

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  font-size: 17px;
  margin: 0;
  height: 100vh;
}

body * {
  color: #212121;
  font-family: Questrial, Avenir, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-appearance: none;
  text-shadow: 0 0 2px #0000000e;
  user-select: none;
}

.bottomFixed {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 500;
  width: 100%;
  height: 20px;
  background-color: #d3d3d3;
}

.timeSlide {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 5px;
  -webkit-appearance: none;
  height: 15px;
  border-radius: 5px;
  background-color: #d3d3d3;
  outline: none;
  opacity: 0.8;
  z-index: 500;
}

.timeSlide::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 35%;
  background: #4CAF50;
  cursor: pointer;
}
</style>
