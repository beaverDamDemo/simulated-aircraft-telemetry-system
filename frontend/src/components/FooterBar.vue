<template>
  <footer class="footer">
    <div class="footer-copy">
      <span>Built with Vue 3 and NestJS</span>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterBar',
};
</script>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  padding: 24px clamp(20px, 4vw, 40px);
  border-top: 1px solid var(--color-footer-border);
  color: var(--color-footer-text);
  font-size: 14px;
  background: var(--color-footer-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
}

.footer-copy {
  display: flex;
  align-items: center;
}

@media (max-width: 860px) {
  .footer {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>