<template>
  <div>
    <mapEl :logs="logs" :stations="stations" :nowTime="nowTime"/>
    <sideBar :logs="logs" :nowTime="nowTime"/>
    <input class="timeSlide" type="range" min="-120" max="0" v-model="timeControl">
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
    fetchedLogs: null,
    logs: {},

    timeControl: 0,
    nowTime: Date.now(),
  }),

  async mounted() {
    window.api.onFetch((logs) => {
      this.fetchedLogs = logs;
    });

    this.stations = await window.api.getStations();

    setInterval(() => {
      this.nowTime = parseInt(Date.now() + (this.timeControl * 60 * 1000), 10);
      if (!this.fetchedLogs) return;
      this.logs = this.fetchedLogs.filter(
        (l) => this.nowTime >= new Date(l.time).getTime(),
      );
    }, 100);
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

.timeSlide {
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 500;
  width: calc(100% - 400px);

  -webkit-appearance: none;
  height: 15px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;
}

.timeSlide::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #4CAF50;
  cursor: pointer;
}
</style>
