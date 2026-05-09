# Frontend Dashboard

Healthcare management dashboard built with React, TypeScript, and Vite.

## Getting started

```bash
npm install

# Optional: set API base URLs (see "Environment variables" below).
cp .env.example .env

# Start the dev server (http://localhost:3001)
npm run dev
```

## Environment variables

Optional environment overrides (Vite). Restart the dev server after changing `.env`:

- Create a `.env` file (see `.env.example` for the format).
- Supported variables:
  - `VITE_API_URL` (HMS API, default: `http://localhost:3000`)
  - `VITE_API_CORE` (default: `http://localhost:3006`)
  - `VITE_API_DEVICE_INFO` (default: `http://localhost:3006`)

## Scripts

- `npm run dev` starts the Vite dev server (configured for port `3001`).
- `npm run build` type-checks (`tsc -b`) and creates a production build in `dist/`.
- `npm run preview` serves the production build locally (run `npm run build` first).
- `npm run analyze` runs the production build with a chunk report and writes `dist/chunk-report.json`.
- `npm run lint` runs ESLint on a targeted set of app sources.
- `npm test` runs the Vitest suite (CI mode).
- `npm run test:watch` runs Vitest in watch mode.
- `npm run test:ui` runs Vitest with the UI runner.

## Performance Checklist

- All active HMS page routes are loaded with `React.lazy()` and rendered behind `Suspense`.
- Route fallbacks use a real skeleton UI through `src/hms/components/RouteSkeleton.tsx`.
- Dashboard and module queries now use memoized derived state plus `staleTime` to avoid unnecessary repeated work and refetches.
- Expensive shared UI pieces such as `DataTable`, `Pagination`, and `PageHeader` are wrapped with `React.memo`.
- `useMemo` and `useCallback` are applied to the heavier `ModulePage` and dashboard data shaping logic.
- Images that still render through `<img />` now use `loading="lazy"`.
- Large tables already use pagination, which satisfies the 50+ row requirement.

## Bundle Size

Measured with `vite build` before and after the route-splitting work.

| Build | Main JS | Gzip |
| --- | ---: | ---: |
| Before | `447.14 kB` | `139.74 kB` |
| After | `320.94 kB` | `105.07 kB` |
| Delta | `-126.20 kB` (`-28.2%`) | `-34.67 kB` (`-24.8%`) |

## Bundle Analysis

Run:

```bash
npm run analyze
```

This generates `dist/chunk-report.json` and confirms dedicated lazy chunks for each HMS page entry:

- `LoginRoutePage`
- `DashboardRoutePage`
- `NotFoundRoutePage`
- `PatientsRoutePage`
- `DoctorsRoutePage`
- `DepartmentsRoutePage`
- `AppointmentsRoutePage`
- `MedicalRecordsRoutePage`
- `PrescriptionsRoutePage`
- `RoomsRoutePage`
- `AdmissionsRoutePage`
- `InvoicesRoutePage`
- `NursesRoutePage`

Shared CRUD route logic is intentionally extracted into shared async chunks such as `createModuleRoutePage-*.js` to avoid duplicating the same code into every page chunk.

## Verification

Latest checks run successfully on May 9, 2026:

- `npm run lint`
- `npm test`
- `npm run analyze`
