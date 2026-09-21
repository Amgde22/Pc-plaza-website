import { defineConfig, passthroughImageService } from "astro/config";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import vue from "@astrojs/vue";
import i18n from "@astrolicious/i18n";
import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Single source of truth for the store's public URL lives in src/data/client.json
// (`domain` must include the www prefix, e.g. "www.pcplaza-15.com").
const client = JSON.parse(readFileSync(new URL("./src/data/client.json", import.meta.url), "utf8"));
const SITE = `https://${client.domain}`;

// This checks if we are NOT running on Netlify
const isLocal = process.env.NETLIFY !== "true";

export default defineConfig({
  // Only apply passthroughImageService if we are local
  image: isLocal ? { service: passthroughImageService() } : undefined,

  site: SITE,

  integrations: [
    icon(),
    sitemap({
      i18n: {
        defaultLocale: 'ar',
        locales: {
          // Must match the hreflang values emitted by I18nHead in the page <head>
          // (plain locale codes, no region subtag) — Google requires them to agree.
          ar: 'ar',
          fr: 'fr',
        },
      },
      filter: (page) => !page.includes("/admin"),
      changefreq: "weekly",
      priority: 0.7,
    }),
    {
      name: "generate-robots-txt",
      hooks: {
        "astro:build:done": ({ dir }) => {
          // Generate robots.txt from the same single source of truth so it can
          // never drift from the site URL again.
          const content = [
            "User-agent: *",
            "Disallow: /admin/",
            "Allow: /",
            "",
            `Sitemap: ${SITE}/sitemap-index.xml`,
            "",
          ].join("\n");
          writeFileSync(join(dir.pathname, "robots.txt"), content);
          console.log(`  robots.txt generated for ${SITE}`);
        },
      },
    },
    i18n({
      defaultLocale: "ar",
      locales: ["ar", "fr"],
      client: {
        data: true,
        paths: true,
      },
    }),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    })
  ],
});
