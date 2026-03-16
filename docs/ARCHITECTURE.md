# Piktiv Architecture Guide

This document describes the architecture of Piktiv and how it aligns with [Angular Architecture Best Practices](https://medium.com/@iamtapan/a-guide-to-effective-angular-architecture-best-practices-b08f7104b2a5) by Tapan Patel.

---

## 1. Modular development

The app is split into logical modules by concern:

```
src/app/
├── core/                 # Singleton services, models
│   ├── config/           # API configuration
│   ├── models/           # Photo, PicsumPhoto
│   ├── services/         # PhotoApiService, FavoritesService
│   └── testing/          # createMockPhoto for specs
├── features/             # Route-level feature components (lazy-loaded)
│   ├── photo-stream/     # InfiniteScrollState inline in component
│   ├── favorites/
│   └── photo-detail/
└── shared/               # Reusable UI and directives
    ├── directives/       # InfiniteScrollDirective, ImageLoadDirective
    ├── photo-card/
    └── header/
```

Each feature has a single responsibility. `core/` contains app-wide concerns; `shared/` is used across features.

---

## 2. Lazy loading

All feature routes use `loadComponent` for lazy loading:

```typescript
// app.routes.ts
{ path: '', loadComponent: () => import('./features/photo-stream/...') },
{ path: 'favorites', loadComponent: () => import('./features/favorites/...') },
{ path: 'photos/:id', loadComponent: () => import('./features/photo-detail/...') },
```

Only the current route’s code is loaded, keeping the initial bundle smaller.

---

## 3. Logic in services, not components

- **PhotoApiService**: API calls and data mapping
- **FavoritesService**: Favorites state, persistence via localStorage (inline, no wrapper)

Components stay thin: they use services and mainly handle layout and UI state.

---

## 4. Reusable components

- **PhotoCardComponent**: Reusable card with inputs/outputs
- **HeaderComponent**: App header with navigation
- **Angular Material**: MatIcon, MatButton, MatProgressSpinner for consistent UI

Shared UI lives under `shared/` and is reused across features.

---

## 5. Memory leak prevention

Subscriptions use `takeUntilDestroyed(this.destroyRef)`:

```typescript
// photo-stream.component.ts, photo-detail.component.ts
this.photoApiService.getPhotos(...)
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe({ ... });
```

Angular’s DestroyRef ensures subscriptions are cleaned up when the component is destroyed.

---

## 6. File and class naming

Following the article’s recommendations:

- **File naming**: `file-feature.filetype` (e.g. `photo-card.component.ts`, `photo-api.service.ts`)
- **Class naming**: UpperCamelCase with type suffix (e.g. `PhotoCardComponent`, `PhotoApiService`)
- **Interfaces**: No `I` prefix (e.g. `Photo`, not `IPhoto`)
- **Properties/methods**: lowerCamelCase

---

## 7. Code size guidelines

- Functions: ~75 lines or fewer
- Files: ~400 lines or fewer
- Components: small, focused, single responsibility

---

## 8. Security

- Angular’s built-in sanitization for templates
- No `bypassSecurityTrust*` usage
- NgOptimizedImage used for image loading
- `preconnect` for external image domains

---

## 9. Configuration and constants

**API config** (`core/config/api.config.ts`): URLs, limits, image dimensions.

**Layout tokens** (global `:root` in `styles.scss`):

- `--layout-header-height`: Fixed header height (64px)
- `--layout-content-min-height`: Min height for scrollable content (accounts for header + safe area)

Components use these so layout stays consistent when the header or viewport changes.

---

## 10. Suggested scaling steps

1. **PWA**: Add `@angular/pwa` for service workers and offline support
2. **State**: Consider NgRx or a similar store if shared state grows
3. **Feature modules**: Group related routes into modules as needed
4. **Guards**: Add route guards for auth or feature flags

---

## Reference

- [A Guide to Effective Angular Architecture: Best Practices](https://medium.com/@iamtapan/a-guide-to-effective-angular-architecture-best-practices-b08f7104b2a5) – Tapan Patel
