# Piktiv

A photo library app built with Angular 21. Browse random photos, add them to favorites, and view details. Favorites persist in localStorage.

## Architecture

The app follows Angular best practices for scalable architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full guide (aligned with [this article](https://medium.com/@iamtapan/a-guide-to-effective-angular-architecture-best-practices-b08f7104b2a5)).

Quick overview:

```
src/app/
├── core/           # Shared business logic (services, models, storage)
├── features/       # Route-level feature components
│   ├── photo-stream/    # Infinite scroll photo grid (/)
│   ├── favorites/      # Saved photos list (/favorites)
│   └── photo-detail/    # Single photo view (/photos/:id)
└── shared/         # Reusable UI and directives
    ├── directives/     # e.g. infinite-scroll
    └── ui/             # Molecules (photo-card) → Organisms (header)
```

- **core**: `PhotoApiService` (Picsum API), `FavoritesService` (signal-based state), `LocalStorageService`
- **features**: One component per route; lazy-loaded
- **shared**: Stateless, reusable pieces used across features

## Environment configuration

Copy `.env.production.example` to `.env.production` and adjust. Run `yarn generate-env` to regenerate `api.config.ts` from `.env.production` (runs automatically before `start` and `build`).

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

E2E tests use [Playwright](https://playwright.dev/). First install browsers:

```bash
npx playwright install
```

Then run tests:

```bash
ng e2e
# or
npx playwright test
```

Start the dev server (`ng serve`) before running E2E, or use `reuseExistingServer: true` in `playwright.config.ts` to use an already running server.

## Docker

Build and run with Docker:

```bash
docker build -t piktiv .
docker run -p 4000:4000 piktiv
```

Or with Docker Compose:

```bash
docker-compose up --build
```

The app will be available at `http://localhost:4000`.

## Performance & Lighthouse Treemap

To analyze bundle size and unused JavaScript with the [Lighthouse Treemap](https://googlechrome.github.io/lighthouse/treemap/?gzip=1#):

1. Run `yarn serve:prod` (builds and serves static files from `dist/piktiv/browser` on port 4200)
2. Open Chrome DevTools → Lighthouse
3. Enable **Capture treemap**, run the audit
4. Export the result as JSON and paste it into the treemap tool

See [docs/PERFORMANCE.md](docs/PERFORMANCE.md) for the full workflow and optimizations.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
