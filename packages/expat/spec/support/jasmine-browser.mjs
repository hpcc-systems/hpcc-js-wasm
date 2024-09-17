export default {
  srcDir: "src",
  srcFiles: [
    "**/*.ts"
  ],
  specDir: "dist-test",
  specFiles: [
    "index.browser.js"
  ],
  env: {
    stopSpecOnExpectationFailure: false,
    stopOnSpecFailure: false,
    random: false
  },

  // For security, listen only to localhost. You can also specify a different
  // hostname or IP address, or remove the property or set it to "*" to listen
  // to all network interfaces.
  listenAddress: "localhost",

  // The hostname that the browser will use to connect to the server.
  hostname: "localhost",

  browser: {
    name: "headlessFirefox"
  }
};
