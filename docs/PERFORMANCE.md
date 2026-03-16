# Performance & Lighthouse Treemap Guide

This document describes performance optimizations and how to use the [Lighthouse Treemap](https://googlechrome.github.io/lighthouse/treemap/?gzip=1#) to analyze and improve bundle size.

## Lighthouse Treemap Workflow

1. **Build for production**
   ```bash
   yarn build
   ```

2. **Serve the production build**
   ```bash
   yarn serve:prod
   ```
   This builds and serves static files from `dist/piktiv/browser` on port 4200.

3. **Run Lighthouse** (Chrome DevTools)
   - Open DevTools → Lighthouse tab
   - Select "Performance" (and optionally "Best practices")
   - Enable "Capture treemap" if available (Chrome 119+)
   - Run analysis against `http://localhost:4200`

4. **Export and analyze in Treemap**
   - In Lighthouse, click the gear icon → enable "Capture treemap"
   - After the run, click the download arrow to export as JSON
   - Paste the JSON at [Lighthouse Treemap](https://googlechrome.github.io/lighthouse/treemap/?gzip=1#)
   - Use the treemap to identify:
     - **Unused JavaScript** (red/orange areas) – candidates for removal or lazy loading
     - **Large dependencies** – consider code splitting or lighter alternatives
     - **Duplicate modules** – consolidate imports

## Render-Blocking Mitigation

Lighthouse may flag "Render blocking requests" (~450ms). This project addresses it via:

- **Main stylesheet** – Loaded with `media="print"` + `onload="this.media='all'"` so it does not block initial render
- **Font stylesheets** – Same deferred pattern; production build inlines `@font-face` and leaves link tags as noscript fallback only
- **Critical CSS** – Inlined in `index.html` plus Angular's `inlineCritical` optimization for above-the-fold layout
- **Resource order** – LCP image preload and preconnects come before font hints to prioritize first paint

## Best Practices Applied

- **Lazy loading** – Routes use `loadComponent()` for code splitting
- **Async fonts** – `media="print"` + `onload` for non-blocking font load
- **Critical CSS** – Inline above-the-fold styles in `index.html`
- **Resource hints** – `preconnect` for Picsum, fastly.picsum.photos (CDN), and fonts; `preload` for LCP image
- **Image optimization** – `NgOptimizedImage` with correct dimensions, priority for LCP candidates

## Treemap-Driven Optimizations

When the treemap shows significant unused bytes:

1. **Lazy load non-critical modules** – Move heavy imports behind route guards or dynamic imports
2. **Replace large libs** – Use lighter alternatives (e.g. smaller icon sets, minimal UI libs)
3. **Tree-shake** – Prefer named imports: `import { X } from 'lib'` over `import * from 'lib`
4. **Defer third-party scripts** – Load analytics/trackers after main content
