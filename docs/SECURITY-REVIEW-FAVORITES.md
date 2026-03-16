# Security Review: Favorites localStorage

**Scope:** `FavoritesService`, `LocalStorageService`, favorites persistence  
**Date:** 2026-03-15

---

## Summary

The favorites feature stores photo metadata in localStorage. Overall risk is **low** because no secrets or sensitive PII are stored. Several improvements are recommended for defensive robustness.

---

## Current Implementation

| Component | Location | Purpose |
|-----------|----------|---------|
| LocalStorageService | `core/storage/local-storage.service.ts` | Abstraction over localStorage with SSR guard |
| FavoritesService | `core/services/favorites.service.ts` | Favorites state, persistence, migration |

**Stored data:** `FavoritesState` = `{ ids: string[], entities: Record<string, Photo> }`  
**Photo fields:** id, author, width, height, imageWidth, imageHeight, imageUrl, pageUrl

---

## Security Checklist

### ✅ Secrets Management

- **No hardcoded secrets** – Storage key is a fixed constant.
- **No tokens or passwords** – Only photo metadata and public URLs.
- **Verdict:** Compliant.

### ⚠️ Input / Data Validation

**Issue:** Parsed localStorage data is trusted without structural validation.

- `JSON.parse(raw)` can return objects with unexpected shape (e.g. from corrupted storage or XSS).
- Prototype pollution via crafted JSON is theoretically possible (e.g. `{"__proto__":{...}}`).
- Malformed data can cause runtime errors: e.g. `raw.ids` not an array breaks `for (const id of raw.ids)`.

**Recommendation:** Validate shape before use:

```typescript
private loadFromStorage(): FavoritesState {
  const raw = this.storage.getItem<unknown>(STORAGE_KEY);
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ids: [], entities: {} };
  }
  const o = raw as Record<string, unknown>;
  const ids = Array.isArray(o.ids) ? o.ids : [];
  const entities = o.entities && typeof o.entities === 'object' && !Array.isArray(o.entities)
    ? (o.entities as Record<string, unknown>) : {};
  const result: FavoritesState = { ids: [], entities: {} };
  for (const id of ids) {
    if (typeof id === 'string' && id in entities) {
      const p = entities[id];
      if (p && typeof p === 'object' && p !== null && 'id' in p) {
        const migrated = this.migratePhoto(p as Partial<Photo> & Pick<Photo, 'id' | 'author' | 'width' | 'height' | 'imageUrl' | 'pageUrl'>);
        result.ids.push(migrated.id);
        result.entities[migrated.id] = migrated;
      }
    }
  }
  return result;
}
```

Use an existing schema validator (e.g. Zod) if you prefer stricter validation.

### ✅ XSS Prevention

- Data is **displayed via Angular templates** – Angular escapes by default.
- Image URLs use **ngSrc** – avoids unsafe `src` binding.
- **Verdict:** Display surface is safe.

**Note:** localStorage is readable by any script on the same origin. If XSS exists elsewhere, an attacker could read or overwrite favorites. Data is not highly sensitive, so impact is limited.

### ✅ SQL Injection

- No database usage; persistence is client-side only.
- **Verdict:** N/A.

### ✅ SSR / Platform Safety

- `isPlatformBrowser()` guards before accessing `localStorage`.
- **Verdict:** Correct.

### ✅ Error Handling

- `JSON.parse` errors are caught; `getItem` returns `null` on failure.
- Quota exceeded on `setItem` is caught and ignored.
- **Verdict:** Reasonable for UX.

### ✅ Storage Key

- Fixed key `piktiv_favorites_v1` – no user-controlled input.
- **Verdict:** Safe.

---

## Recommendations

| Priority | Action |
|----------|--------|
| Medium | Add structural validation in `loadFromStorage()` to reject malformed data and reduce prototype pollution risk. |
| Low | Optionally use `Object.create(null)` for parsed result to avoid prototype chain. |
| Low | Add basic schema validation (e.g. Zod) if the app grows or data shape becomes more complex. |

---

## Conclusion

The favorites localStorage implementation is suitable for storing non-sensitive preference data. The main improvement is **defensive validation** of parsed data to handle corrupted storage and reduce risk from prototype pollution. No critical vulnerabilities were identified.
