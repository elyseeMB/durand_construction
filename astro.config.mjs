// @ts-check
import { defineConfig } from "astro/config";

import preact from "@astrojs/preact";

import markdoc from "@astrojs/markdoc";

// https://astro.build/config
export default defineConfig({
  integrations: [preact(), markdoc()],
});