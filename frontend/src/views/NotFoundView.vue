<template>
  <section class="not-found-view">
    <div class="not-found-card">
      <p class="eyebrow">Page not found</p>
      <h1>404</h1>
      <p class="message">The page you are looking for does not exist.</p>
      <router-link class="home-button" to="/">Go back home</router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: 'NotFoundView',
};
</script>

<style scoped>
.not-found-view {
  width: 100%;
  min-height: clamp(420px, 70vh, 760px);
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background:
    linear-gradient(rgba(248, 251, 255, 0.46), rgba(238, 244, 251, 0.72)),
    url('../assets/images/404-33.jpg') center center / cover no-repeat;
  border-radius: var(--radius-card);
}

.not-found-card {
  width: min(520px, 100%);
  padding: 28px 30px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(53, 73, 94, 0.12);
  box-shadow: 0 18px 50px rgba(53, 73, 94, 0.16);
  text-align: center;
}

.eyebrow {
  margin: 0 0 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 700;
}

h1 {
  margin: 0;
  font-size: clamp(4rem, 12vw, 7rem);
  line-height: 1;
  color: var(--color-secondary);
}

.message {
  margin: 12px 0 22px;
  color: var(--color-muted);
}

.home-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 20px;
  border-radius: var(--radius-button);
  background: linear-gradient(180deg, #ffffff 0%, #f7fbf8 100%);
  color: var(--color-secondary);
  font-weight: 800;
  text-decoration: none;
  border: 1px solid rgba(53, 73, 94, 0.16);
  box-shadow: 0 10px 24px rgba(53, 73, 94, 0.08);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.home-button:hover {
  transform: translateY(-1px);
  border-color: rgba(66, 185, 131, 0.42);
  box-shadow: 0 14px 30px rgba(53, 73, 94, 0.14);
}

@media (max-width: 640px) {
  .not-found-card {
    padding: 24px 20px;
  }
}
</style>