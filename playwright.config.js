// Playwright config for the browser prototype tests.
// Serves web/ on :4173 (matching the URL hard-coded in tests/web-3d.spec.js)
// and reuses a running server locally so you can `npm run test:web` against
// your own static server if one is already up.
const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "tests",
  testMatch: "web-3d.spec.js",
  timeout: 60_000,
  webServer: {
    command: "python3 -m http.server 4173 --directory web --bind 127.0.0.1",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
