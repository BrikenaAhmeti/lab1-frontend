# MedSphere Frontend Dashboard

MedSphere is a role-aware healthcare management dashboard built with React, TypeScript, Vite, TanStack Query, Axios, Tailwind CSS, i18next, Redux Toolkit, Vitest, and Testing Library.

The app manages daily hospital workflows for admins, doctors, nurses, and receptionists. Frontend permissions are used to show the correct navigation and actions for each role, while the backend must still enforce authorization for every endpoint.

## Getting Started

```bash
npm install

# Optional local API overrides.
cp .env.example .env

# Start the Vite dev server.
npm run dev
```

The dev server is configured for:

```text
http://localhost:3001
```

## Environment Variables

Vite reads optional API overrides from `.env`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_CORE` | `http://localhost:3011` | Main backend base URL. |
| `VITE_API_URL` | falls back to `VITE_API_CORE` | Hospital Management System API base URL. |
| `VITE_API_DEVICE_INFO` | falls back to `VITE_API_CORE` | Secondary base URL used by the legacy Axios client. |

Restart the dev server after changing `.env`.

## Scripts

- `npm run dev` starts Vite on port `3001`.
- `npm run build` type-checks with `tsc -b` and creates `dist/`.
- `npm run preview` serves the production build locally.
- `npm run analyze` builds with chunk analysis and writes `dist/chunk-report.json`.
- `npm run lint` runs ESLint against `src` and `tests`.
- `npm test` runs the Vitest suite in CI mode.
- `npm run test:watch` runs Vitest in watch mode.
- `npm run test:ui` opens the Vitest UI runner.

## Routes

Public routes:

- `/`
- `/login`
- `/confirm-email`

Protected routes:

- `/dashboard`
- `/patients`
- `/doctors`
- `/departments`
- `/appointments`
- `/medical-records`
- `/prescriptions`
- `/rooms`
- `/admissions`
- `/invoices`
- `/nurses`
- `/receptionists`
- `/unauthorized`

Unknown routes render the not-found page.

## Role-Based Functionality

Roles and permissions are defined in `src/config/permissions.ts`.

| Module | Admin | Doctor | Nurse | Receptionist |
| --- | --- | --- | --- | --- |
| Dashboard | View/read | View/read | View/read | View/read |
| Patients | Create/read/update/delete | Read | Read | Create/read/update |
| Doctors | Create/read/update/delete | No access | No access | No access |
| Departments | Create/read/update/delete | No access | No access | No access |
| Appointments | Create/read/update/delete/action | Read/update/action | Read | Create/read/update/action |
| Medical records | Create/read/update/delete | Create/read/update | Read | Read |
| Prescriptions | Create/read/update/delete | Create/read/update | Read | Read |
| Rooms | Create/read/update/delete/action | Read | View/read | View/read |
| Admissions | Create/read/update/delete/action | Read | View/read | Create/read/update/action |
| Invoices | Create/read/update/delete/action | No access | No access | Create/read/update/action |
| Nurses | Create/read/update/delete | No access | No access | No access |
| Receptionists | Create/read/update | No access | No access | No access |
| Users | Create/read/update/delete | No access | No access | No access |

Permission actions:

- `VIEW` shows the route/navigation item.
- `READ` allows data fetching and read-only display.
- `CREATE`, `UPDATE`, and `DELETE` control CRUD buttons and mutations.
- `ACTION` controls workflow actions such as appointment status changes, payment, or admission actions.

## Main Workflow

Recommended hospital setup order:

1. Create departments.
2. Create rooms for departments.
3. Create doctors and portal account details.
4. Create nurses and portal account details.
5. Create receptionist accounts.
6. Create or update patients.
7. Schedule appointments after patients and doctors exist.
8. Create admissions after patients and available rooms exist.
9. Create medical records after patients and doctors exist.
10. Create prescriptions after medical records exist.
11. Create invoices after patients exist.
12. Use the dashboard to monitor today's appointments, available rooms, and active admissions.

## Backend Contract Notes

- Auth uses `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`, `/api/auth/logout-all`, `/api/auth/me`, `/api/auth/change-password`, `/api/auth/confirm-email`, and `/api/auth/users/:userId/password`.
- The app sends requests with `withCredentials: true`; local backend CORS must allow credentials.
- Paginated lists should return `data` or `items`, plus `total`, `page`, `limit`, and `totalPages`.
- API responses may use snake_case or camelCase; the current app client normalizes many response keys to camelCase.
- Appointments render `date`/`time` and also tolerate `appointmentDate`/`appointmentTime`.
- Medical record `prescriptionsText` is a summary only; medicine rows belong in prescriptions.
- Doctor creation in the current generic module uses doctor profile fields plus email and optional username. The older dashboard doctor form also supports linking an existing user and optional manual password.
- Nurse creation uses nurse profile fields plus required email and username; the backend is expected to send the generated password and confirmation link where supported.
- Admissions can be created by admins and receptionists in the active permission matrix. Nurses are read-only for admissions.
- Generic admission edit/delete UI is disabled even though admin permissions include update/delete, so discharge-style changes should be implemented as explicit actions.
- Invoices belong to patients and can optionally link to appointments or admissions if the backend supports those relationships.

## Documentation

- Full frontend prompt and role-based specification: `docs/frontend-detailed-prompt.md`
- Frontend/backend integration guide: `docs/frontend-backend-guide.md`

## Verification

Latest checks run successfully on June 6, 2026:

- `npm test` - 22 test files passed, 63 tests passed.
- `npm run lint` - passed.
- `npm run build` - passed.

Recommended verification before release:

```bash
npm test
npm run lint
npm run build
```
