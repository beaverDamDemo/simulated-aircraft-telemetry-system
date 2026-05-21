<template>
  <section class="hero">
    <router-link class="hero-button" to="/telemetry-map">
      Open telemetry map
    </router-link>
  </section>
</template>

<script>
export default {
  name: 'HomeView',
};
</script>

<style scoped>
.hero {
  width: 100%;
  min-height: clamp(420px, 70vh, 760px);
  display: grid;
  place-items: center;
  padding: 32px 20px;
}

.hero-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 19px 29px;
  min-width: 240px;
  border-radius: 16px;
  background: var(--color-hero-bg);
  color: var(--color-hero-text);
  font-weight: 800;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  text-decoration: none;
  border: 1px solid var(--color-hero-border);
  box-shadow:
    var(--color-hero-shadow),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.hero-button::after {
  content: '→';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.24);
  color: var(--color-hero-text);
  font-size: 1rem;
  line-height: 1;
}

.hero-button:hover {
  background: var(--color-hero-hover-bg);
  border-color: var(--color-hero-hover-border);
  transform: translateY(-3px) scale(1.01);
  box-shadow:
    var(--color-hero-hover-shadow),
    0 0 0 1px rgba(255, 255, 255, 0.18);
}

.hero-button:focus-visible {
  outline: 3px solid rgba(66, 185, 131, 0.28);
  outline-offset: 4px;
}
</style>