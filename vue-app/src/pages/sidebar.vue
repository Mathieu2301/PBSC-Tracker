<template>
  <div class="sidebar">
    <div class="topTitle">Movements {{ getHour() }}</div>
    <div class="container">
      <div class="log" v-for="(log, i) in logs" :key="i">
        <div class="left">
          <div>{{ log.sName }}</div>
          <div class="small">{{ log.time }}</div>
        </div>
        <div class="middled small" v-if="log.diff < 0">
          <div>{{ calcDistance(log.time) }}</div>
          <div v-if="!isArrived(log.time)">{{ calcTime(log.time) }} s</div>
        </div>
        <div class="middled">
          <svg viewBox="0 0 100 100" :fill="log.type === 'E' ? '#0080ff' : '#8d00c9'">
            <!-- eslint-disable-next-line -->
            <path d="M50,21c15.99,0,29,13.009,29,29c0,15.99-13.01,29-29,29c-15.991,0-29-13.01-29-29C21,34.009,34.009,21,50,21 M50,5C25.147,5,5,25.147,5,50c0,24.853,20.147,45,45,45c24.853,0,45-20.147,45-45C95,25.147,74.853,5,50,5L50,5z"/>
            <circle v-if="log.diff > 0" cx="50" cy="50" r="15"/>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const addZeros = (i) => (parseInt(i, 10) < 10 ? `0${i}` : i);

export default {
  name: 'Sidebar',
  props: {
    logs: Object,
    nowTime: Number,
  },

  methods: {
    calcDistance(time) {
      const value = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);
      return (value < window.config.maxDistance ? `${value} m` : 'Arrived');
    },

    isArrived(time) {
      const value = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);
      return (value >= window.config.maxDistance);
    },

    calcTime(time) {
      const sec = Math.round((this.nowTime - new Date(time).getTime()) / 1000);
      return `${Math.floor(sec / 60)}:${addZeros(sec % 60)}`;
    },

    getHour() {
      const date = new Date(this.nowTime);
      return `${addZeros(date.getHours())}:${addZeros(date.getMinutes())}:${addZeros(date.getSeconds())}`;
    },
  },
};
</script>

<style scoped>
  .sidebar {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    background-color: #ddddddd9;
    z-index: 1500;
    box-shadow: 0 0 10px #46464654;
  }

  .topTitle {
    height: 50px;
    font-size: 23px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #cecece;
  }

  .container {
    padding-top: 10px;
    overflow-y: scroll;
    height: calc(100% - 50px);
  }

  .log {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
  }

  .left {
    text-align: left;
  }

  .small {
    opacity: 0.7;
    font-size: 15px;
  }

  .middled {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  svg {
    width: 25px;
  }
</style>
