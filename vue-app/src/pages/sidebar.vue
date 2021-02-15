<template>
  <div>
    <div class="sidebar" :class="{ hide: hideSidebar }">
      <div class="sidebarBtn" @click="hideSidebar = !hideSidebar">
        <!-- eslint-disable-next-line -->
        <svg height="50" viewBox="500 0 400 400"><path d="M700,100c-9.2,0-16.7,7.5-16.7,16.7s7.5,16.7,16.7,16.7h100c9.2,0,16.7-7.5,16.7-16.7S809.2,100,800,100H700z"/><path d="M586.1,190.8c-0.3,0.4-0.4,1-0.6,1.5c-0.5,0.9-0.9,1.9-1.2,2.9c-0.2,0.6-0.5,1.1-0.7,1.7  c-0.1,0.6,0,1.1,0,1.7c0,0.5-0.3,1-0.3,1.5s0.3,1,0.3,1.5c0.1,0.6-0.1,1.1,0,1.7c0.1,0.6,0.5,1.1,0.7,1.7c0.3,1,0.7,2,1.2,2.9  c0.3,0.5,0.3,1,0.6,1.5c0,0,0,0,0,0l33.3,50c3.2,4.8,8.5,7.4,13.9,7.4c3.2,0,6.4-0.9,9.2-2.8c7.7-5.1,9.7-15.5,4.6-23.1l-16.1-24.1H800c9.2,0,16.7-7.5,16.7-16.7s-7.5-16.7-16.7-16.7H631.1l16.1-24.1c5.1-7.7,3-18-4.6-23.1c-7.7-5.1-18-3-23.1,4.6L586.1,190.8C586.1,190.8,586.1,190.8,586.1,190.8z"/><path d="M800,266.7H700c-9.2,0-16.7,7.5-16.7,16.7S690.8,300,700,300h100c9.2,0,16.7-7.5,16.7-16.7S809.2,266.7,800,266.7z"/></svg>
      </div>
      <div class="topTitle">{{ getHour() }}</div>
      <div class="container" v-if="startsList">
        <div class="start"
          v-for="start in startsList" :key="start.UID"
          :class="{
            selected: selectedStart === start.UID,
            hide: new Date(start.time).getTime() > nowTime,
          }"
          @click="selectStart(start.UID)">
          <div class="visible">
            <div class="left">
              <div>{{ start.sName }}</div>
              <div class="small">{{ start.time }}</div>
            </div>
            <div class="column small" v-if="new Date(start.time).getTime() > nowTime">
              Not gone
            </div>
            <div class="column small" v-else-if="(
              !start.results
            )">
              <div>{{ calcDistance(start.time) }}</div>
              <div>{{ calcTime(start.time) }}</div>
            </div>
            <div class="column small" v-else>
              {{ start.results }} result{{ (start.results > 1) ? 's' : '' }}
            </div>
            <div class="column">
              <svg class="bikeSvg" viewBox="0 0 100 100"
                :fill="start.type === 'E' ? '#0080ff' : '#8d00c9'"
              >
                <!-- eslint-disable-next-line -->
                <path d="M50,21c15.99,0,29,13.009,29,29c0,15.99-13.01,29-29,29c-15.991,0-29-13.01-29-29C21,34.009,34.009,21,50,21 M50,5C25.147,5,5,25.147,5,50c0,24.853,20.147,45,45,45c24.853,0,45-20.147,45-45C95,25.147,74.853,5,50,5L50,5z"/>
                <circle v-if="start.results > 0" cx="50" cy="50" r="15"/>
              </svg>
            </div>
          </div>
          <div class="drop" :class="{ open: selectedStart === start.UID }">
            <div class="end" v-for="end in sort(start.ends)" :key="end.sID">
              <div class="list">
                <div class="left">
                  <div>{{ end.sName }}</div>
                  <div class="small">{{ end.speed }} km/h</div>
                </div>
                <div class="column">
                  <div class="small">
                    {{ end.percent }} %
                  </div>
                  <div class="small">
                    <!-- {{ Math.round(1 / (usedEnds[end.UID]) * 1000) / 1000 }} -->
                    1 / {{ Math.round(usedEnds[end.UID] * 100) / 100 }}
                  </div>
                </div>
                <div class="column">
                  <div class="small important">
                    {{ formatTime(end.realDuration) }} ({{ end.realDistance }} m)
                  </div>
                  <div class="small">
                    {{ formatTime(end.time) }} ({{ formatDiff(end.time, end.realDuration) }})
                  </div>
                </div>
              </div>
              <div class="barContainer">
                <div class="bar" :style="{ width: end.percent + '%' }"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="loader" v-else>
        <!-- eslint-disable-next-line -->
        <svg width="40" viewBox="0 0 55 80"><g transform="matrix(1 0 0 -1 0 80)"><rect width="10" height="20" rx="3"><animate attributeName="height" begin="0s" dur="4.3s" values="20;45;57;80;64;32;66;45;64;23;66;13;64;56;34;34;2;23;76;79;20" calcMode="linear" repeatCount="indefinite"/></rect><rect x="15" width="10" height="80" rx="3"><animate attributeName="height" begin="0s" dur="2s" values="80;55;33;5;75;23;73;33;12;14;60;80" calcMode="linear" repeatCount="indefinite"/></rect><rect x="30" width="10" height="50" rx="3"><animate attributeName="height" begin="0s" dur="1.4s" values="50;34;78;23;56;23;34;76;80;54;21;50" calcMode="linear" repeatCount="indefinite"/></rect><rect x="45" width="10" height="30" rx="3"><animate attributeName="height" begin="0s" dur="2s" values="30;45;13;80;56;72;45;76;34;23;67;30" calcMode="linear" repeatCount="indefinite"/></rect></g></svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    nowTime: Number,
    starts: Object,
    usedEnds: Object,
    selectStart: Function,
    selectedStart: String,
  },

  data: () => ({
    hideSidebar: true,
    startsList: null,
  }),

  watch: {
    starts() {
      this.startsList = [];

      Object.keys(this.starts).forEach((UID) => {
        this.startsList.push({ UID, ...this.starts[UID] });
      });

      this.startsList = this.startsList.sort((a, b) => (
        new Date(a.time).getTime() < new Date(b.time).getTime() ? 1 : -1
      ));
    },
  },

  methods: {
    sort(s) {
      return Object.values(s).sort((a, b) => (a.prob < b.prob ? 1 : -1));
    },

    calcDistance(time) {
      const value = window.config.distanceCalc(new Date(time).getTime(), this.nowTime);
      return (value < 1000 ? `${value} m` : `${Math.round(value / 100) / 10} km`);
    },

    formatTime(sec) {
      return (sec < 3600)
        ? `${Math.floor(sec / 60)}:${window.addZeros(Math.round(sec) % 60)} s`
        : `${Math.floor(sec / 3600)}h${window.addZeros(Math.round((sec / 60) % 60))}`;
    },

    formatDiff(s1, s2) {
      const sec = Math.abs(s2 - s1);
      return `${s2 > s1 ? '-' : '+'} ${Math.floor(sec / 60)}:${window.addZeros(sec % 60)}`;
    },

    calcTime(time) {
      return this.formatTime(Math.round((this.nowTime - new Date(time).getTime()) / 1000));
    },

    getHour() {
      const date = new Date(this.nowTime);
      return `${window.addZeros(date.getHours())
      }:${window.addZeros(date.getMinutes())
      }:${window.addZeros(date.getSeconds())}`;
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

  .sidebar, .sidebar :not(rect) {
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

  .sidebarBtn > svg {
    width: 25px;
    fill: #474747;
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
    overflow-x: hidden;
    height: calc(100% - 50px);
  }

  .start:not(.hide):hover,
  .start:not(.hide).selected { box-shadow: #7676763b 0 0 5px 0 }
  .start.hide { opacity: 0.3 }

  .visible, .list {
    display: grid;
    grid-template-columns: 140px 1fr 1fr;
    padding: 10px 20px;
    cursor: pointer;
    transition-timing-function: ease;
  }

  .drop {
    height: 100%;
    opacity: 1;
    padding: 5px;
    padding-left: 10px;
  }

  .drop:not(.open) {
    height: 0;
    opacity: 0;
    padding: 0;
    font-size: 0;
    transform: scale(.5);
    pointer-events: none;
  }

  .drop *, .small { font-size: 15px }

  .drop .small { font-size: 13px }
  .small:not(.important) { opacity: 0.7 }

  .left {
    text-align: left;
  }

  .left { width: 150px }

  .column {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .column:last-child {
    text-align: right;
    align-items: flex-end;
  }

  .barContainer {
    width: calc(100% - 40px);
    height: 8px;
    padding: 2px;
    border-radius: 10px;
    margin: 0 20px;
    background-color: #cacaca;
  }
  .barContainer > .bar {
    height: 4px;
    border-radius: 10px;
    background-color: #2aa21994;
  }

  .bikeSvg { width: 25px }

  .loader {
    height: 90%;
    display: flex;
    justify-content: center;
    align-items: center;
    fill: #8c8c8c99;
  }
</style>
