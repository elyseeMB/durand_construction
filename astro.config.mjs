// @ts-check
import { defineConfig, passthroughImageService } from "astro/config";

import preact from "@astrojs/preact";

import markdoc from "@astrojs/markdoc";

import sitemap from "@astrojs/sitemap";

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
  // site: "https://durand-construction.com",
  site: "https://elyseemb.github.io/durand_construction/",
  build: {
    assets: "_astro",
  },
  image: {
    service: passthroughImageService(),
  },
  base: "/durand_construction/",
  integrations: [
    preact(),
    markdoc(),
    sitemap({
      i18n: {
        defaultLocale: "fr",
        locales: {
          fr: "fr-CA",
          en: "en-US",
          es: "es-ES",
        },
      },
    }),
  ],
});
