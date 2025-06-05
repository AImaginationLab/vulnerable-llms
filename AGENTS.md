# Agents Guide

Always run backend API tests after making changes.

Run the tests with:

```bash
pytest
```
## Roadmap

As of today, we plan to align the development, build, and production processes between Python and JavaScript/TypeScript stacks. Here are the key steps:

1. Collapse to a single, multi-stage Dockerfile
   - Use a “builder” stage to:
     • Install Python & Node.js dependencies
     • Run the embeddings precompute script
     • Install frontend packages and build assets
   - Add a “development” target that:
     • Mounts source code via docker-compose override
     • Installs dev-only tools (e.g. `watchdog`)
     • Runs both Vite dev server (`npm run dev`) and FastAPI dev server (`backend/dev_server.py`)
   - Add a “production” target that:
     • Copies built static assets into `backend/static`
     • Uses a clean Python runtime with only production dependencies
     • Exposes port 5000 and starts `uvicorn backend.main:app`

2. Use one `docker-compose.yml` + `docker-compose.override.yml`
   - Production base file `docker-compose.yml`:
     • Builds the `production` stage from `Dockerfile`
     • No source-code mounts, only mounts `./content`
     • Exposes port 5000 and runs the production Uvicorn CMD
   - Development override file `docker-compose.override.yml`:
     • Builds the `development` stage from `Dockerfile` (target: development)
     • Mounts `./backend` and `./frontend` for live-reload
     • Exposes ports 3000 & 5000 and runs both Vite & FastAPI dev servers
   - Removed old `docker-compose.dev.yml`

3. Standardize scripts at the root level
   - Root `package.json` now provides unified scripts:
     • `npm run install`       → installs Python & frontend dependencies
     • `npm run build`         → builds frontend assets then Docker images
     • `npm run frontend:install|build|dev|lint|typecheck` → granular JS/TS tasks
     • `npm run test`          → runs pytest + frontend lint + frontend type-check + frontend tests
     • `npm run dev`           → brings up dev environment via `docker-compose up`
   - We chose to orchestrate both Python and JS workflows via npm scripts rather than a separate Makefile
   - Top-level commands now cover install, build, test, and dev for the entire stack

4. Add a JS/TS test runner for the frontend
   - Installed Vitest in `frontend/devDependencies` and added test scripts (`test`, `test:run`)
   - Created `frontend/vitest.config.ts` with jsdom environment and setup file
   - Added `src/setupTests.ts` to import `@testing-library/jest-dom` for matchers
   - Added smoke test `src/__tests__/Homepage.test.tsx` verifying main headings are rendered
   - Exposed `frontend:test` script in root and updated root `npm run test` to include frontend tests

5. Introduce a CI pipeline (GitHub Actions)
   - Added `.github/workflows/ci.yml` with two jobs:
     1. **build**: installs frontend & Python deps, builds the frontend assets, and runs the embedding precompute script
     2. **test**: runs backend tests (`pytest`), frontend lint (`npm run lint`), frontend type-check, and frontend tests (`vitest`)
   - Uses `actions/setup-node` with npm caching and `actions/setup-python` for Python
   - Workflow triggers on `push` and `pull_request` to `main`

6. Cleanup environment & docs
   - Added `.env.example` with `OLLAMA_HOST`; use `cp .env.example .env` to override defaults
   - Removed build fallbacks (`|| echo …`) so build/test failures now bubble up
   - Updated README: unified Quick Start, Development, and Tests sections; removed `docker-compose.dev.yml` references
   - (Optional) Add CI status badges to README in next iteration

We will update this file as we make changes or need to jot down notes.

## Validation Steps

After every set of changes (regardless of commit status), the agent should:

- Reflect on what was modified and identify impacted layers: backend code, frontend code, container definitions, or documentation.
- For backend changes:
  - Run `pytest` to ensure all backend tests pass.
- For frontend changes:
  - Ensure `frontend/package-lock.json` is in sync; if not, run `npm install` inside `frontend/` to update it.
  - In `frontend/`, run lint, type-check, and Vitest tests:
    ```bash
    npm run frontend:lint
    npm run frontend:typecheck
    npm run frontend:test
    ```
- For container or configuration changes:
  1. Rebuild and start the production image:
     ```bash
     docker-compose -f docker-compose.yml build
     docker-compose -f docker-compose.yml up -d
     ```
     Then perform smoke tests against critical API endpoints or UI pages.
     ```bash
     # e.g. curl or browser check to verify the app responds correctly
     ```
     Tear down:
     ```bash
     docker-compose -f docker-compose.yml down
     ```
  2. Rebuild and start the development image:
     ```bash
     docker-compose -f docker-compose.yml -f docker-compose.override.yml build
     docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
     ```
     Perform similar smoke tests, then tear down:
     ```bash
     docker-compose -f docker-compose.yml -f docker-compose.override.yml down
     ```

If Docker Compose is unavailable in the environment, skip container tests but always verify code-level checks pass.