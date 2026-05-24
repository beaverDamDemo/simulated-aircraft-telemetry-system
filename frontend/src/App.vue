<template>
  <div class="page">
    <HeaderBar :theme-name="themeName" @toggle-theme="toggleTheme" />
    <main class="shell">
      <router-view />
    </main>
    <FooterBar />
  </div>
</template>

<script setup>
import HeaderBar from './components/HeaderBar.vue';
import FooterBar from './components/FooterBar.vue';
import { useTheme } from './composables/useTheme';

const { themeName, toggleTheme } = useTheme();
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
