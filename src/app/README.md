# App Structure

Clean, scalable folder layout:

```
app/
├── core/           # Singletons, app-wide
│   ├── config/     # API URLs, constants
│   ├── models/     # Types (Photo, StoredPhoto, etc.)
│   ├── services/   # PhotoApiService, FavoritesService
│   └── testing/    # Test helpers (createMockPhoto)
├── features/       # Route-level, lazy-loaded
│   ├── photo-stream/
│   ├── favorites/
│   └── photo-detail/
└── shared/         # Reusable across features
    ├── directives/
    ├── photo-card/
    └── header/
```

**Conventions**
- `core/` — imports from `@app/core`
- `shared/` — imports from `@app/shared`
- New features → add under `features/`, register in `app.routes.ts`
- New shared UI → add under `shared/`
