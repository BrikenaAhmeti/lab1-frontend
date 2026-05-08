# Frontend Dashboard

Healthcare management dashboard built with React, TypeScript, and Vite.

## Scripts

- `npm run dev` starts the Vite dev server.
- `npm run build` runs the production build.
- `npm run analyze` runs the production build with a chunk report and writes `dist/chunk-report.json`.
- `npm test` runs the Vitest suite.
- `npm run lint` runs ESLint on the active app source.

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
| After | `318.76 kB` | `104.24 kB` |
| Delta | `-128.38 kB` (`-28.7%`) | `-35.50 kB` (`-25.4%`) |

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

Latest checks run successfully on May 8, 2026:

- `npm run lint`
- `npm test`
- `npm run analyze`
