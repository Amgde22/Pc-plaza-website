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

6. **Hreflang mismatch: head vs sitemap** — head emitted `ar`/`fr`, sitemap emitted `ar-DZ`/`fr-FR` (Google requires both to agree), and there was no `x-default`.
   → Sitemap locales changed to `ar`/`fr` in `astro.config.mjs`; `x-default` link added in `BaseLayout.astro` pointing to the default-locale (ar) version of each page via `getSwitcherData()`.

7. **Titles** — home AR title was generic ("الصفحة الرئيسية"), FR home duplicated the brand (`Accueil | PC PLAZA Tizi Ouzou | PC plaza 15`), and the home title ended with a dangling comma from the empty `state` field.
   → Keyword-rich home titles in both locales (`home.title` in common.json, e.g. "أجهزة كمبيوتر محمولة جديدة ومستعملة في تيزي وزو"); title logic in BaseLayout: home pages use the locale title as-is, other pages get `Page | Brand`. Empty `state`/`zip` no longer leak into titles.

8. **Brand casing inconsistent** ("PC plaza 15" vs "PC PLAZA") → `client.json` `name` is now "PC PLAZA 15" everywhere.

9. **No structured data (0 ld+json)** → Added, all derived from `client.json` (new-store-safe):
   - `ComputerStore` (LocalBusiness): name, address (Tizi Ouzou), geo phone, opening hours, `sameAs` (Instagram/Facebook), priceRange — in `BaseLayout.astro`, sitewide.
   - `FAQPage`: 5 Q&As mirrored from the locale strings used by the visible FAQ — on home.
   - `Product` + `Offer`: name, description, image, price in DZD, InStock/OutOfStock — one per SSR'd product, on home. (Move to product detail pages when they exist.)

10. **Social metadata incomplete** → Added `og:site_name`, `og:locale` (+ `og:locale:alternate` per language), and full Twitter card tags (`summary_large_image`) in `BaseLayout.astro`.

11. **Wrong city in Arabic products description** — said سيدي بلعباس (Sidi Bel Abbès), a leftover from the template's original store. → Fixed to تيزي وزو (Tizi Ouzou) in `src/locales/ar/common.json`.

12. **404 page leaked SEO signals** — it was canonicalized, hreflang'd, and had LocalBusiness JSON-LD (all pointless on an error page), and was indexable.
   → `BaseLayout.astro` now skips canonical/I18nHead/x-default/JSON-LD on 404 and emits `<meta name="robots" content="noindex, follow">`; 404 removed from the sitemap filter as well.

13. **Skip-link hardcoded in English** on an AR/RTL site → new `accessibility.skip_to_content` key in both locale files; `BaseLayout.astro` renders it via `t()` (تخطَّ إلى المحتوى الرئيسي / Aller au contenu principal).

14. **Sitemap noise** — `changefreq`/`priority` are ignored by Google → removed from the sitemap config; sitemap now lists only real pages (4 URLs, no 404).

15. **Netlify-badge MutationObserver script ran on every page** → deleted (~1 KB of JS per page). Replaced by a CSS `display:none` rule for `#nl-badge-frame` in `root.less`, which also can't be defeated by async re-injection.

## 🔲 Pending (priority order)

- **Missing alt text** — hero carousel images have empty `alt`; write descriptive alts.
- **No H1 on /produits?** — fixed by #3 (Vue `h1.title` is now SSR'd); 404 still has two H1s.
- **Heavy product images** — cards load 500–870 KB JPEGs; convert to WebP/AVIF.
- **Hygiene** — empty `<meta name="keywords">`, obsolete `X-UA-Compatible`, stale `theme-color`.
- **JS payload** — home still ships ~222 KB JS / ~88 KB CSS (Vue island + Shoelace); next lever is trimming Shoelace components or lazy-loading the product dialogs.
- **Off-page (not in repo, user action):** ① Netlify — set `www.pcplaza-15.com` as **primary** domain (else redirect loop). ② Submit the sitemap in Google Search Console. ③ **Google Business Profile** — make sure GBP links to `https://www.pcplaza-15.com` and that Name/Address/Phone match the footer and the `ComputerStore` schema exactly (PC PLAZA 15 / Ameyoud, Tizi Ouzou / +213 792 41 59 56) — NAP consistency is the biggest local-SEO multiplier for a physical store.

## Workflow changes

- **Re-pointing the site to a new store:** edit ONLY `src/data/client.json` (`domain`, contact, address). robots.txt, sitemap, canonicals, og:url, og:image follow automatically.
- **Adding a page:** lowercase filename in `src/routes/` — the filename IS the URL. Update `src/data/navData.json` to match.
- **Never use `client:only`** on components that render text content — make the component SSR-safe instead (`typeof window !== "undefined"` guards; no `document` in module/setup scope; pass locale via props, never read it from the DOM).
- **Verify SEO changes against the build**, not dev mode: `npm run build`, then inspect `dist/`.
- **Structured data flows from client.json** — when adding a store field (e.g. geo coordinates), surface it in the `ComputerStore` JSON-LD in `BaseLayout.astro` too.
- **hreflang must agree everywhere** — page `<head>` (I18nHead + x-default) and sitemap locales in `astro.config.mjs` must emit the same values; if you change one, change both.
- **Home titles are keywords, page titles are labels** — `home.title` in both common.json files carries the keyword-rich SERP title (brand + city included); do not append the brand again for home routes (BaseLayout already handles this).
- **Netlify redirects** live in `public/_redirects` — add any domain/route renames there so old URLs don't die.
