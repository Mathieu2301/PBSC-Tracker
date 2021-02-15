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
    fetchedLogs: null,
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
      this.fetchedLogs = data.operations;
      this.stationsBikes = data.stations;
    });

    setInterval(() => {
      this.nowTime = parseInt(Date.now() + (this.timeControl * 60 * 1000), 10);
      if (!this.fetchedLogs) return;
      this.logs = this.fetchedLogs.filter(
        (l) => this.nowTime >= new Date(l.time).getTime(),
      );
      this.computePaths();
    }, 1000);
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
          this.starts[start.UID] = {
            sID: start.sID,
            sName: this.stations[start.sID].name,
            time: start.time,
            type: start.type,
            ends: {},
          };
          return;
        }

        this.logs.filter((e) => (
          e.diff > 0
          && new Date(start.time).getTime() < new Date(e.time).getTime()
          && new Date(e.time).getTime() - new Date(start.time).getTime() < 2700000
          && e.type === start.type
        )).forEach((end) => {
          if (this.starts[start.UID].ends[end.sID]) return;
          const duration = (new Date(end.time).getTime() - new Date(start.time).getTime()) / 1000;
          const realPath = window.paths[`${start.sID}>${end.sID}`] ?? [0, 0, 0, 0];

          const root = (duration > realPath[3] ? 20 : 2);
          let prob = 1 / ((((duration - realPath[3]) + 1) ** 2) ** (1 / root));

          if (duration < 15 && start.sID === end.sID) prob = 1;

          if (!this.usedEnds[end.UID]) this.usedEnds[end.UID] = 0;
          this.usedEnds[end.UID] += prob;

          this.starts[start.UID].ends[end.sID] = {
            UID: end.UID,
            sID: end.sID,
            sName: this.stations[end.sID].name,
            time: duration,
            realDuration: realPath[3],
            realDistance: realPath[2],
            speed: Math.round((realPath[2] / duration) * 36) / 10,
            percent: Math.round(prob * 10000) / 100,
            prob,
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
