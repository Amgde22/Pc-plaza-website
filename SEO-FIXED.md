# SEO Fixes — Roadmap

Audit done 2026-09 on the Astro build output (`npm run build` → inspect `dist/`).
Rule: anything marked ✅ is verified in the built HTML, not just in source.

## ✅ Fixed

1. **Three conflicting domains** — canonicals said `pc-plaza15.com`, hreflang/sitemap said `infopc-sba.com`, robots.txt pointed at dead `infopc.netlify.app`.
   → **Single source of truth:** `src/data/client.json` → `domain`. `astro.config.mjs` reads it for `site` (drives sitemap + hreflang); robots.txt is **generated at build time** (see `generate-robots-txt` hook in astro.config.mjs). Never hand-edit robots.txt again. Canonical host: `https://www.pcplaza-15.com`.

2. **`/produits` 404 (route case mismatch)** — nav links pointed to lowercase, page was built at `/Produits/`.
   → Renamed route file to lowercase (`src/routes/produits.astro`); added 301 redirects in `public/_redirects` for old `/Produits` + all legacy domains.

3. **Product catalog invisible to crawlers** (`client:only="vue"` → empty HTML).
   → Root cause: `src/js/useT.js` read `document` during setup and `Products.vue` read `window.innerWidth` during render — both crash SSR.
   → Fixed: `useT.js` is SSR-safe and takes the locale as a param; Astro pages pass `lang={getLocale()}` down the chain (`Products → ProductCard / SelectNav`); viewport slice now happens in `onMounted` (hydration), not during render.
   → Both pages now use `client:visible` (SSR + hydrate on scroll). Product names, prices, descriptions, images, tags are all in the served HTML.

4. **og:image was a relative path** (scrapers can't resolve it) → absolute URL derived from `client.json`.

5. **Render-blocking Google Fonts `@import`** (Wallpoet) — slowed CSS, broke offline builds. Removed; only user was dead CSS `.font-logo` in utils.less. Fonts are self-hosted (Mada/Roboto).

## 🔲 Pending (priority order)

- **Wrong city in Arabic copy** — `src/locales/ar/common.json` → `products.description` says سيدي بلعباس (Sidi Bel Abbès); store is in Tizi Ouzou.
- **Titles** — home AR title is generic ("الصفحة الرئيسية"), FR title duplicates brand, trailing comma in home title (empty `state` in client.json).
- **No structured data** — add JSON-LD: `ComputerStore` (local business), `FAQPage`, then `Product`/`Offer` once product detail pages exist.
- **Missing alt text** — hero carousel images have empty `alt`; write descriptive alts.
- **No H1 on /produits?** — fixed by #3 (Vue `h1.title` is now SSR'd); 404 still has two H1s.
- **Heavy product images** — cards load 500–870 KB JPEGs; convert to WebP/AVIF.
- **Hygiene** — empty `<meta name="keywords">`, obsolete `X-UA-Compatible`, stale `theme-color`, skip-link hardcoded in English.
- **Off-page (not in repo)** — Netlify: set `www.pcplaza-15.com` as **primary** domain (else redirect loop); submit sitemap in Search Console; keep Google Business Profile NAP consistent with footer.

## Workflow changes

- **Re-pointing the site to a new store:** edit ONLY `src/data/client.json` (`domain`, contact, address). robots.txt, sitemap, canonicals, og:url, og:image follow automatically.
- **Adding a page:** lowercase filename in `src/routes/` — the filename IS the URL. Update `src/data/navData.json` to match.
- **Never use `client:only`** on components that render text content — make the component SSR-safe instead (`typeof window !== "undefined"` guards; no `document` in module/setup scope; pass locale via props, never read it from the DOM).
- **Verify SEO changes against the build**, not dev mode: `npm run build`, then inspect `dist/`.
- **Netlify redirects** live in `public/_redirects` — add any domain/route renames there so old URLs don't die.
