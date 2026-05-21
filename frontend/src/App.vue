<template>
  <div class="page">
    <HeaderBar :theme-name="themeName" @toggle-theme="toggleTheme" />
    <main class="shell">
      <router-view />
    </main>
    <FooterBar />
  </div>
</template>

<script>
import HeaderBar from './components/HeaderBar.vue';
import FooterBar from './components/FooterBar.vue';

export default {
  name: 'App',
  components: {
    HeaderBar,
    FooterBar,
  },
  data() {
    return {
      themeName: 'default',
    };
  },
  mounted() {
    this.themeName = localStorage.getItem('themeName') || 'default';
    this.applyTheme();
  },
  methods: {
    toggleTheme() {
      this.themeName = this.themeName === 'default' ? 'vibrant' : 'default';
      localStorage.setItem('themeName', this.themeName);
      this.applyTheme();
    },
    applyTheme() {
      document.body.dataset.theme = this.themeName;
      document.body.dataset.themeName = this.themeName;
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.shell {
  flex: 1;
  display: grid;
  place-items: center;
}
</style>
