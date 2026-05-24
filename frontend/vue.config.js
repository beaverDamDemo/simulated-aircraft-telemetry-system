const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    config.plugin('eslint').tap((args) => {
      args[0].cache = false;
      return args;
    });
  },
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
        target: 'http://backend:3000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://backend:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
});
