module.exports = {
  server: {
    command: 'npx http-server -p 8081',
    port: 8081,
    launchTimeout: 10000,
    debug: true,
  },
  launch: {
    headless: "new"
  }
};
