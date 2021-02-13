<template>
  <div>
    <div class="sidebar" :class="{ hide: hideSidebar }">
      <div class="sidebarBtn" @click="hideSidebar = !hideSidebar">
        <!-- eslint-disable-next-line -->
        <svg height="50px" viewBox="500 0 400 400"><path d="M700,100c-9.2,0-16.7,7.5-16.7,16.7s7.5,16.7,16.7,16.7h100c9.2,0,16.7-7.5,16.7-16.7S809.2,100,800,100H700z"/><path d="M586.1,190.8c-0.3,0.4-0.4,1-0.6,1.5c-0.5,0.9-0.9,1.9-1.2,2.9c-0.2,0.6-0.5,1.1-0.7,1.7  c-0.1,0.6,0,1.1,0,1.7c0,0.5-0.3,1-0.3,1.5s0.3,1,0.3,1.5c0.1,0.6-0.1,1.1,0,1.7c0.1,0.6,0.5,1.1,0.7,1.7c0.3,1,0.7,2,1.2,2.9  c0.3,0.5,0.3,1,0.6,1.5c0,0,0,0,0,0l33.3,50c3.2,4.8,8.5,7.4,13.9,7.4c3.2,0,6.4-0.9,9.2-2.8c7.7-5.1,9.7-15.5,4.6-23.1l-16.1-24.1H800c9.2,0,16.7-7.5,16.7-16.7s-7.5-16.7-16.7-16.7H631.1l16.1-24.1c5.1-7.7,3-18-4.6-23.1c-7.7-5.1-18-3-23.1,4.6L586.1,190.8C586.1,190.8,586.1,190.8,586.1,190.8z"/><path d="M800,266.7H700c-9.2,0-16.7,7.5-16.7,16.7S690.8,300,700,300h100c9.2,0,16.7-7.5,16.7-16.7S809.2,266.7,800,266.7z"/></svg>
      </div>
      <div class="topTitle">{{ getHour() }}</div>
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

  data: () => ({
    hideSidebar: true,
  }),

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
    bottom: 20px;
    width: 400px;
    background-color: #ddddddd9;
    box-shadow: 0 0 10px #46464654;
  }

  .sidebar, .sidebar * {
    transition-duration: 0.4s;
    transition-timing-function: cubic-bezier(0.8, -0.2, 0.2, 1.2);
  }

  .sidebarBtn {
    position: fixed;
    top: 0;
    right: 0;
    height: 50px;
    width: 50px;
    cursor: pointer;
    display: none;
    background-color: #ddddddd9;
    transform: translateX(calc(50px - 100vw));
    z-index: 10;
  }

  .sidebar.hide > .sidebarBtn {
    transform: translateX(-800px);
  }

  .sidebar:not(.hide) > .sidebarBtn > svg {
    transform: rotate(-540deg);
  }

  @media screen and (max-width: 800px) {
    .sidebar { width: 100% }
    .sidebar.hide { transform: translateX(800px) }
    .sidebarBtn { display: block }
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
    width: 150px;
  }

  .small {
    opacity: 0.7;
    font-size: 15px;
  }

  .middled {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  svg {
    width: 25px;
  }
</style>
