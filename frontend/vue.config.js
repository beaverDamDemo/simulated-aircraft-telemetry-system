const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/main.js',
      title: 'Aircraft Telemetry Dashboard',
    },
  },
  devServer: {
    port: 4200,
    proxy: {
      '/hello': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
