// @ts-check
import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  server: {
    allowedHosts: [
      "7fbb-102-129-78-29.ngrok-free.app",
      "5894-102-129-78-29.ngrok-free.app",
      "4a03-102-129-78-29.ngrok-free.app",
      "12e4-102-129-78-29.ngrok-free.app",
      "aa5f-102-129-78-29.ngrok-free.app",
    ],
  },
  integrations: [preact(), markdoc()],
});
