# Search Architecture Decision

## Context
- Server: Armbian aarch64, 1.8GB RAM, 4 core ARMv8
- Stack: Laravel 13 + FrankenPHP (SQLite WAL mode)
- Frontend: React SPA (single bootstrap load)

## Current: Local Search
All submissions fetched once via `/api/bootstrap`, stored in Zustand, searched client-side.

### Pros
- Simple, zero latency after initial load
- No additional API endpoints
- Works offline (cached data)

### Cons
- Loads all data upfront (~1.5 KB per submission)
- Bandwidth: 3.7 MB × N users on page load

## Alternative: Search/Pagination API
Per-request fetch with query params, paginated results.

### Pros
- Lightweight per request
- Scales to thousands of concurrent users
- Lower initial load time

### Cons
- More complex frontend (debounce, loading states, pagination UI)
- Every search = network round trip
- Requires new endpoint + frontend refactor

## Threshold Analysis

| Data size | Payload | 10 users | 100 users |
|-----------|---------|----------|-----------|
| 1K submissions | ~1.5 MB | 15 MB | 150 MB |
| 10K submissions | ~15 MB | 150 MB | 1.5 GB |
| 5K submissions + services | ~19 MB | 190 MB | 1.9 GB |

## Decision (2026-06-19)

**Stay with local search until performance degradation is actually observed.**

Rationale:
- Current data ~3 submissions ≈ 4.7 KB — negligible
- 1,000 submissions ≈ 1.5 MB — still fine
- 100 concurrent admin users is unrealistic for DLH Pontianak (real max: 5-10)
- Premature optimization adds complexity without measurable benefit

## When to migrate

When initial load time exceeds 2 seconds or data exceeds 5,000 submissions.
Migration scope:
1. `GET /api/submissions/search?q=&page=1&per_page=20` endpoint
2. Replace `submissions.find()` with `fetch()` in `TrackingSobat.tsx`
3. Add debounce + loading state in search input
4. Add pagination controls in tracking UI
