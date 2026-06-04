# Detailed Frontend Prompt And Specification

Use this document as a frontend-focused prompt for an AI assistant, frontend developer, or reviewer working on the MedSphere healthcare dashboard.

## Copy-Paste Prompt

You are a senior frontend engineer working on the MedSphere healthcare management dashboard. Build and maintain a React, TypeScript, Vite frontend for a hospital management system. The app must be clear, role-aware, tested, responsive, and aligned with the backend API contract.

Use the current codebase patterns:

- React 19, TypeScript, Vite.
- React Router for routes.
- TanStack Query for API data, caching, loading, errors, mutations, and invalidation.
- Axios for HTTP requests.
- Zod for form validation.
- Tailwind CSS for styling.
- i18next/react-i18next for English and German localization.
- Redux Toolkit only where existing legacy/auth code already uses it.
- Reusable UI components from `src/ui`.
- Current API helpers from `src/libs/app/api.ts` for the main module system.
- Role and permission rules from `src/config/permissions.ts`.
- Module definitions from `src/config/modules.tsx`.

Implement frontend features using the actual business flow:

1. Admin logs in.
2. Admin creates departments first because doctors, nurses, and rooms depend on departments.
3. Admin creates rooms for departments.
4. Admin creates doctors and optionally creates or links doctor user accounts.
5. Admin creates nurses and optionally creates or links nurse user accounts.
6. Admin or receptionist creates patients.
7. Admin, receptionist, or doctor creates appointments after patients and doctors exist.
8. Admin, receptionist, or nurse creates admissions after patients and rooms exist.
9. Doctor or admin creates medical records after patients and doctors exist.
10. Doctor or admin creates prescriptions after medical records exist.
11. Admin or receptionist creates invoices after patients exist, optionally linked to appointments or admissions if backend supports it.
12. Dashboard shows live operational summaries from appointments, available rooms, and active admissions.

Every page must handle loading, empty, error, retry, success, validation, and read-only states. Every action must be hidden or disabled based on user role. Frontend permission checks are only UX protection; backend must still enforce authorization.

## Project Purpose

MedSphere is a hospital dashboard for managing:

- Patients.
- Doctors.
- Departments.
- Appointments.
- Medical records.
- Prescriptions.
- Rooms.
- Admissions.
- Invoices.
- Nurses.
- Receptionists.
- Authenticated users and staff portal access.

The frontend should help hospital staff perform daily workflows quickly:

- Admins configure and manage the hospital system.
- Receptionists handle patient intake, appointment scheduling, admissions, and billing.
- Doctors review patients, manage appointments, create medical records, and write prescriptions.
- Nurses view patient, room, admission, and clinical information needed for care support.

## Important Local Files

- App entry: [`src/main.tsx`](../src/main.tsx)
- App router: [`src/app/router.tsx`](../src/app/router.tsx)
- Providers: [`src/app/providers/AppProviders.tsx`](../src/app/providers/AppProviders.tsx)
- Auth provider: [`src/app/contexts/AuthContext.tsx`](../src/app/contexts/AuthContext.tsx)
- Current API client: [`src/libs/app/api.ts`](../src/libs/app/api.ts)
- Utilities and normalization: [`src/libs/app/utils.ts`](../src/libs/app/utils.ts)
- Main module config: [`src/config/modules.tsx`](../src/config/modules.tsx)
- Route metadata: [`src/config/moduleMeta.ts`](../src/config/moduleMeta.ts)
- Permissions: [`src/config/permissions.ts`](../src/config/permissions.ts)
- Generic CRUD page: [`src/pages/app/ModulePage.tsx`](../src/pages/app/ModulePage.tsx)
- Main layout: [`src/ui/organisms/AppLayout.tsx`](../src/ui/organisms/AppLayout.tsx)
- UI components: [`src/ui`](../src/ui)
- Domain-specific older pages: [`src/pages/Dashboard`](../src/pages/Dashboard)
- Tests: [`tests`](../tests) and colocated `*.test.tsx` files.

## Tech Used

| Tech | Purpose |
| --- | --- |
| React 19 | Component rendering and UI state. |
| TypeScript | Typed props, DTOs, API responses, and safer refactoring. |
| Vite | Dev server, fast builds, route chunk analysis. |
| React Router | Public, guest, private, and module routing. |
| TanStack Query | Server-state fetching, cache, stale time, mutations, retries, invalidation. |
| Axios | HTTP client with auth headers and refresh-token retry flow. |
| Zod | Form schemas and validation messages. |
| Tailwind CSS | Utility styling and responsive layout. |
| i18next/react-i18next | English/German translations. |
| Redux Toolkit | Existing auth compatibility, transactions, and auth chat slices. |
| Vitest | Unit and integration test runner. |
| Testing Library | User-focused component and page tests. |

## App Flow

### Startup Flow

1. `src/main.tsx` imports CSS and i18n.
2. Theme is applied before render.
3. `AppProviders` wraps the app with Redux, language, query, toast, and auth providers.
4. `App.tsx` creates the browser router.
5. `AppRouter` loads public or protected routes.
6. `AuthProvider` tries cookie-based refresh.
7. If authenticated, the protected layout and sidebar are shown.
8. Sidebar navigation is filtered by role permissions.

### Auth Flow

1. User opens `/login`.
2. Login form sends `{ identifier, password }` to `/api/auth/login`.
3. Backend returns `{ accessToken, user? }`.
4. If `user` is missing, frontend calls `/api/auth/me`.
5. Access token is kept in memory and mirrored to Redux for older code paths.
6. API client attaches `Authorization: Bearer <token>`.
7. If an API request returns `401`, frontend calls `/api/auth/refresh`.
8. If refresh succeeds, original request is retried.
9. If refresh fails, session is cleared and user goes to `/login`.

### Generic Module Page Flow

For most modules, the generic `ModulePage` handles the flow:

1. Read module config from `src/config/modules.tsx`.
2. Read URL query params for page, limit, sort, order, and filters.
3. Check role permissions from `src/config/permissions.ts`.
4. Fetch list data with TanStack Query if user has `READ`.
5. Fetch reference dropdown data only when filters/forms need it.
6. Show skeleton, empty state, table, or error with retry.
7. On create/edit, open entity form modal.
8. Validate using Zod schema.
9. Clean payload with module `cleanPayload`.
10. Send create/update mutation.
11. Invalidate module query.
12. Show toast and close modal.
13. On delete, confirm and send delete mutation.
14. Update pagination if the page becomes empty.

## Main Business Data Flow

Follow this setup order in the UI because many modules depend on previous data:

### 1. Departments

Create departments first.

Why:

- Doctors belong to departments.
- Nurses belong to departments.
- Rooms belong to departments.
- Department names appear in dropdowns and tables.

Frontend route:

- `/departments`

Backend:

- `/api/departments`
- `/api/departments/all` for dropdowns.

### 2. Rooms

Create rooms after departments.

Why:

- Admissions need available rooms.
- Dashboard needs available room data.
- Rooms display department names.

Frontend route:

- `/rooms`

Important:

- Room status controls whether room can be selected for admissions.
- Available rooms come from `/api/rooms/available` where possible.

### 3. Doctors

Create doctors after departments and user account decisions.

Doctor account modes:

- Link existing user with `userId`.
- Create new login with `email`, optional `username`, optional `password`.

Why:

- Appointments require doctors.
- Medical records require doctors.
- Doctor login role controls medical-record and prescription access.

Frontend route:

- `/doctors`

### 4. Nurses

Create nurses after departments and user account decisions.

Nurse account modes:

- Link existing user with `userId`.
- Create new login with `email`, optional `username`, optional `password`.
- Backend may also allow nurses without portal login depending on implementation.

Why:

- Nurses need department and shift information.
- Nurses can view patients, rooms, admissions, medical records, and prescriptions.

Frontend route:

- `/nurses`

### 5. Receptionists

Create receptionist accounts from the auth users area.

Why:

- Receptionists handle patient intake, appointments, admissions, and invoices.
- Receptionists need a portal login.

Frontend route:

- `/receptionists`

Backend:

- List users from `/api/auth/users`.
- Create receptionist from `/api/auth/users/receptionists`.

### 6. Patients

Create patients before appointments, admissions, medical records, prescriptions, and invoices.

Why:

- Almost every clinical and billing workflow starts with a patient.

Frontend route:

- `/patients`

### 7. Appointments

Create appointments after patients and doctors exist.

Why:

- Appointment form needs patient and doctor dropdowns.
- Dashboard shows today's appointments.
- Medical workflow often starts from scheduled/completed appointments.

Frontend route:

- `/appointments`

### 8. Admissions

Create admissions after patients and available rooms exist.

Why:

- Admission form needs patient and room.
- Rooms should not be full or under maintenance.
- Dashboard shows active admissions.

Frontend route:

- `/admissions`

### 9. Medical Records

Create medical records after patients and doctors exist.

Why:

- Medical records are linked to a patient and doctor.
- Prescriptions need a medical record.

Frontend routes:

- `/medical-records`
- `/medical-records/new`
- `/medical-records/:id/edit`

Special behavior:

- Medical records use a specialized page from `src/pages/Dashboard/medical-records`.
- Doctor/admin can manage records in the specialized page.
- Nurse can view records but should not see create/edit/delete actions.
- Non-admin doctors may auto-select their own active doctor profile in the form.

### 10. Prescriptions

Create prescriptions after medical records exist.

Why:

- Every prescription must link to a medical record.
- Prescription rows store medicine-specific details.
- `prescriptionsText` on a medical record is only a summary.

Frontend route:

- `/prescriptions`

Special behavior:

- Prescriptions use a specialized page from `src/pages/Dashboard/prescriptions`.
- User first selects/sees patient and medical record, then manages prescriptions for that record.
- Doctor/admin can create, update, delete, and print.
- Nurse can view only.

### 11. Invoices

Create invoices after patients exist.

Why:

- Invoice belongs to a patient.
- Backend contract may optionally link invoices to appointments or admissions.

Frontend route:

- `/invoices`

Special actions:

- Mark pending invoice as paid.
- Cancel invoice if supported by page/backend.

### 12. Dashboard

Dashboard becomes useful after operational data exists.

It shows:

- Today's appointments.
- Available rooms.
- Active admissions.

Frontend route:

- `/dashboard`

## Roles And Functionalities

### Admin

Admin is the system manager.

Can access:

- Dashboard.
- Patients.
- Doctors.
- Departments.
- Appointments.
- Medical records.
- Prescriptions.
- Rooms.
- Admissions.
- Invoices.
- Nurses.
- Receptionists.
- Users, through auth/admin endpoints and user-related module flows.

Admin can:

- Create, view, update, and delete patients.
- Create, view, update, and delete doctors.
- Create, view, update, and delete departments.
- Create, view, update, delete, and run actions on appointments.
- Create, view, update, and delete medical records where UI supports it.
- Create, view, update, and delete prescriptions.
- Create, view, update, delete, and run actions on rooms.
- Create, view, update, and run actions on admissions. Current generic admissions UI hides edit/delete actions even though permissions include them.
- Create, view, update, and run billing actions on invoices.
- Create, view, update, and delete nurses.
- Create, view, and update receptionists. Delete is hidden for receptionists.
- Reset passwords for linked user accounts.
- Manage staff portal account setup for doctors and nurses.

Admin setup workflow:

1. Create departments.
2. Create rooms.
3. Create doctors.
4. Create nurses.
5. Create receptionists.
6. Add patients or let receptionists do it.
7. Monitor dashboard and all modules.

### Doctor

Doctor is the clinical record and prescription user.

Can access:

- Dashboard.
- Patients in read-only mode.
- Appointments.
- Medical records.
- Prescriptions.
- Rooms read-only.
- Admissions read-only.

Doctor can:

- View patient profiles.
- View appointments.
- Update appointment status or perform allowed appointment actions.
- Create and update medical records.
- Create and update prescriptions.
- View rooms and admissions.
- In specialized medical-records pages, doctor/admin role helpers currently show management actions.

Doctor workflow:

1. Open dashboard or appointments.
2. Review today's appointments.
3. Open patient information.
4. Create or update medical record for the patient.
5. Add prescriptions linked to that medical record.
6. Review admissions/rooms if patient is admitted.

### Nurse

Nurse is mostly care-support and read-focused.

Can access:

- Dashboard.
- Patients read-only.
- Appointments read-only.
- Medical records read-only.
- Prescriptions read-only.
- Rooms read-only.
- Admissions read-only.

Nurse can:

- View patients.
- View appointment schedule.
- View medical records.
- View prescriptions.
- View room status.
- View active and discharged admissions.
- Not create invoices.
- Not manage doctors, departments, nurses, receptionists, or users.

Nurse workflow:

1. Open dashboard.
2. Check active admissions.
3. Check room status and patient information.
4. View medical records and prescriptions.
5. Use data for care coordination without modifying restricted data.

### Receptionist

Receptionist is front desk and billing support.

Can access:

- Dashboard.
- Patients.
- Appointments.
- Rooms read-only.
- Admissions.
- Invoices.

Receptionist can:

- Create, view, and update patients.
- Create, view, update, and run appointment actions.
- View rooms.
- Create, view, update, and run admission actions.
- Create, view, update, and run invoice actions.
- Not access medical records or prescriptions.
- Not manage doctors, departments, nurses, receptionists, or users.

Receptionist workflow:

1. Search or create patient.
2. Schedule appointment with doctor.
3. If patient is admitted, create admission and select available room.
4. Create invoice for patient.
5. Mark invoice paid when payment is received.

## CRUD, Filters, Sorts, And Fields By Module

### Patients

Route:

- `/patients`

Endpoint:

- `/api/patients`

CRUD:

- Admin: create, read, update, delete.
- Receptionist: create, read, update.
- Doctor: read.
- Nurse: read.

Filters:

- `search`: first or last name.
- `bloodGroup`: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
- `gender`: `MALE`, `FEMALE`, `OTHER`.

Sort options:

- `createdAt`.
- `firstName`.
- `lastName`.
- `dateOfBirth`.

Form fields:

- `firstName`.
- `lastName`.
- `dateOfBirth`.
- `gender`.
- `phoneNumber`.
- `bloodType`.
- `address`.

Frontend details:

- Patient is required before appointments, admissions, medical records, prescriptions, and invoices.
- Patient dropdowns usually request up to 100 records or use search in specialized pages.

Tests to include:

- List renders patients.
- Search and filter params are sent.
- Create submits trimmed valid payload.
- Update submits expected payload.
- Delete only visible for admin.
- Doctor/nurse see read-only state.
- Empty state can show create action only when allowed.

### Departments

Route:

- `/departments`

Endpoint:

- `/api/departments`
- `/api/departments/all` for dropdowns.

CRUD:

- Admin: create, read, update, delete.
- Other roles: no access.

Filters:

- None.

Sort options:

- `createdAt`.
- `name`.
- `location`.

Form fields:

- `name`.
- `location`.
- `description`.

Frontend details:

- Departments should be created before doctors, nurses, and rooms.
- Department dropdown labels use department name.

Tests to include:

- Admin sees create/edit/delete.
- Non-admin cannot route in or cannot see nav.
- Create/update validation requires name and location.
- Dropdown endpoint `/api/departments/all` is used for references.

### Doctors

Route:

- `/doctors`

Endpoint:

- `/api/doctors`

CRUD:

- Admin: create, read, update, delete.
- Other roles: no access from the doctors management module.

Filters:

- `departmentId`.
- `specialization`.

Sort options:

- `createdAt`.
- `firstName`.
- `lastName`.
- `specialization`.

Form fields:

- `accountMode`: `existing` or `new`, create only.
- `userId`: existing user link.
- `firstName`.
- `lastName`.
- `specialization`.
- `departmentId`.
- `phoneNumber`.
- `email`: when creating a new login.
- `password`: optional when creating a new login.
- `username`: optional when creating a new login.

Frontend details:

- Department must exist before creating doctor.
- Existing user options come from `/api/auth/users`.
- New login payload omits `userId` and includes email/username/password when provided.
- Phone number should match format like `+38344111222`.
- Password reset can appear when doctor has a linked `userId`.

Tests to include:

- Non-admin create route or action is forbidden.
- Admin create submits doctor fields.
- New linked user mode sends email/username/password and omits `userId`.
- Invalid optional new user fields show friendly validation.
- Department filter is passed to query.
- Delete only visible for admin.

### Nurses

Route:

- `/nurses`

Endpoint:

- `/api/nurses`

CRUD:

- Admin: create, read, update, delete.
- Other roles: no access from nurses management module.

Filters:

- `departmentId`.
- Some older nurse list tests also cover a shift filter in specialized pages. The current generic module config only lists `departmentId`.

Sort options:

- `createdAt`.
- `firstName`.
- `lastName`.
- `shift`.

Form fields:

- `accountMode`: `existing` or `new`, create only.
- `userId`: existing user link.
- `firstName`.
- `lastName`.
- `departmentId`.
- `shift`: `Morning`, `Evening`, `Night`.
- `email`: when creating a new login.
- `password`: optional when creating a new login.
- `username`: optional when creating a new login.

Frontend details:

- Department must exist before creating nurse.
- Existing user options come from `/api/auth/users`.
- New login mode sends email/username/password and omits `userId`.
- Password reset can appear when nurse has a linked `userId`.

Tests to include:

- Create form trims values.
- New linked user mode sends only the correct fields.
- Invalid optional new user fields show validation.
- Department filter is passed.
- Shift rendering/filtering is covered if using the older specialized nurse list.

### Receptionists

Route:

- `/receptionists`

Endpoints:

- List: `/api/auth/users`.
- Create: `/api/auth/users/receptionists`.
- Update: `/api/auth/users/:id`.
- Password reset: `/api/auth/users/:userId/password`.

CRUD:

- Admin: create, read, update.
- Delete is hidden.
- Other roles: no access.

Filters:

- `search`: first name, last name, email, username. Done client-side after users are loaded.
- `isActive`: true/false. Done client-side.
- `emailConfirmed`: true/false. Done client-side.

Sort options:

- `createdAt`.
- `firstName`.
- `lastName`.
- `email`.

Form fields:

- `firstName`.
- `lastName`.
- `email`.
- `username`.
- `password`: create only.
- `phoneNumber`.
- `isActive`.
- `emailConfirmed`.
- `lockoutEnabled`.

Frontend details:

- The list fetches all users and filters users whose roles include `RECEPTIONIST`.
- Pagination and filtering are client-side in the receptionist service.
- Receptionist create payload uses boolean values for status fields.

Tests to include:

- Creates receptionist with auth-specific payload shape.
- Client-side search/status/email-confirmed filters work.
- Delete action is hidden.
- Password reset works when user id exists.

### Appointments

Route:

- `/appointments`

Endpoint:

- `/api/appointments`

CRUD:

- Admin: create, read, update, delete, action.
- Receptionist: create, read, update, action.
- Doctor: read, update, action.
- Nurse: read.

Filters:

- `date`.
- `doctorId`.
- `patientId`.
- `status`: `Scheduled`, `Completed`, `Cancelled`.
- `from`.
- `to`.

Sort options:

- `createdAt`.
- `date`.
- `time`.
- `status`.

Form fields:

- `patientId`.
- `doctorId`.
- `date`.
- `time`.
- `status`: edit only.
- `notes`.

Frontend details:

- Patient and doctor must exist before creating appointment.
- Create defaults status to `Scheduled`; generic create payload omits status.
- Renderers can read `date`/`time` or `appointmentDate`/`appointmentTime`.
- Backend and frontend should align on final DTO names.

Tests to include:

- Create appointment with trimmed values.
- Date/doctor/patient/status/from/to filters are passed.
- Doctor can update or run allowed status actions.
- Nurse sees read-only view.
- Locked/completed/cancelled appointments disable invalid actions.

### Medical Records

Routes:

- `/medical-records`.
- `/medical-records/new`.
- `/medical-records/:id/edit`.

Endpoint:

- `/api/medical-records`

CRUD:

- Admin: create, read, update, delete where UI supports it.
- Doctor: create, read, update in permission matrix. Specialized page currently shows doctor/admin management actions.
- Nurse: read.
- Receptionist: no access.

Filters:

- `patientId`.
- Specialized page also has `patientSearch` to search patient options before selecting patient.

Sort options in generic config:

- `createdAt`.
- `date`.
- `diagnosis`.

Form fields:

- `patientId`.
- `doctorId`.
- `date`.
- `diagnosis`.
- `treatment`.
- `prescriptionsText`.

Frontend details:

- Patient and active doctor must exist before creating record.
- Specialized form validates active doctors.
- Non-admin doctor may auto-select own active doctor profile by matching current user id to doctor `userId`.
- `prescriptionsText` is only a summary. Actual medication rows live in prescriptions.
- Nurse sees records without write actions.

Tests to include:

- Patient selector/search controls record list.
- Nurse does not see create/edit/delete.
- Doctor/admin see write actions.
- Create route forbids unauthorized users.
- Create submits trimmed payload.
- Inactive doctor validation appears.
- Detail errors map to friendly states for 401, 403, 404, and generic errors.

### Prescriptions

Route:

- `/prescriptions`

Endpoint:

- `/api/prescriptions`
- Specialized page also uses `/api/medical-records/:id/prescriptions`.

CRUD:

- Admin: create, read, update, delete.
- Doctor: create, read, update.
- Specialized prescriptions page lets doctor/admin manage prescriptions.
- Nurse: read.
- Receptionist: no access.

Filters:

- Generic config: `medicalRecordId`.
- Specialized page: `patientId` and `recordId` in URL search params.
- Specialized page also uses `patientSearch` for patient options.

Sort options:

- `createdAt`.
- `medicine`.
- `dosage`.
- `duration`.

Form fields:

- `medicalRecordId`.
- `medicine`.
- `dosage`.
- `duration`.
- `instructions`.

Frontend details:

- Medical record must exist before prescription.
- User selects patient, then record, then manages prescriptions for that record.
- Required fields are medicine, dosage, and duration.
- Instructions can be empty and become `null`.

Tests to include:

- Creates prescription for selected medical record.
- Required field validation.
- Update and delete for managers.
- Print action for managers if using prescription panel.
- Nurse sees view-only mode.

### Rooms

Route:

- `/rooms`

Endpoint:

- `/api/rooms`
- `/api/rooms/available` for available room references.

CRUD:

- Admin: create, read, update, delete, action.
- Nurse: read.
- Receptionist: read.
- Doctor: read.

Filters:

- `departmentId`.
- `type`: `GENERAL`, `ICU`, `SURGERY`, `EMERGENCY`, `PEDIATRIC`.

Sort options:

- `createdAt`.
- `roomNumber`.
- `type`.
- `status`.
- `capacity`.

Form fields:

- `roomNumber`.
- `departmentId`.
- `type`.
- `status`: `AVAILABLE`, `OCCUPIED`, `UNDER_MAINTENANCE`.
- `capacity`.

Frontend details:

- Department must exist before room.
- Create defaults status to `AVAILABLE`.
- Admissions should disable rooms that are unavailable, full, or under maintenance.

Tests to include:

- Department/type filters are passed.
- Room status and availability details render.
- Admin actions visible only for admin.
- Create/edit forms trim and normalize values.
- Details page shows current admissions if using specialized room details.

### Admissions

Route:

- `/admissions`

Endpoint:

- `/api/admissions`
- `/api/admissions/active`
- Discharge action may use `/api/admissions/:id/discharge` in older domain API.

CRUD:

- Admin: create, read, update, delete, action by permission. Current generic page disables edit/delete actions.
- Receptionist: create, read, update, action.
- Nurse: read-only in the active permission config.
- Doctor: read.

Filters:

- `status`: `ACTIVE`, `DISCHARGED`.
- `patientId`.
- `roomId`.

Sort options:

- `createdAt`.
- `admissionDate`.
- `dischargeDate`.
- `status`.

Form fields:

- `patientId`.
- `roomId`.
- `admissionDate`.

Frontend details:

- Patient and available room must exist before admission.
- Active admissions appear on dashboard.
- Discharging an active admission should update room availability.
- Older specialized admission tests cover status filter, disabled unavailable rooms, create admission, and discharge action.

Tests to include:

- Status filter is passed to query.
- Patient and room are required.
- Full, occupied, or maintenance rooms are disabled in create form.
- Create admission sends patientId, roomId, admissionDate.
- Discharge action confirms and calls mutation.
- Read-only users cannot create/discharge.

### Invoices

Route:

- `/invoices`

Endpoint:

- `/api/invoices`
- `/api/invoices/stats`
- Pay action may use `/api/invoices/:id/pay`.

CRUD:

- Admin: create, read, update, delete, action.
- Receptionist: create, read, update, action.
- Doctor: no invoice access in main permission matrix.
- Nurse: no invoice access.

Filters:

- `patientId`.
- `status`: `PENDING`, `PAID`, `CANCELLED`.

Sort options:

- `createdAt`.
- `date`.
- `amount`.
- `status`.

Form fields:

- `patientId`.
- `amount`.
- `date`.
- `status`: edit only.
- `description`.

Frontend details:

- Patient must exist before invoice.
- Create defaults status to `PENDING`; generic create payload omits status.
- Older specialized invoice page uses `invoiceDate` in payload.
- Can show total revenue card from stats endpoint.
- Can mark pending invoice as paid.

Tests to include:

- Revenue card renders.
- Status and patient filters are passed.
- Create invoice sends expected payload.
- Mark-as-paid confirms and calls mutation.
- View-only/no-access roles do not see management actions.

## Dashboard Functionalities

Route:

- `/dashboard`

Widgets:

- Today's appointments.
- Available rooms.
- Active admissions.

Endpoints:

- `/api/dashboard/appointments/today`, fallback `/api/appointments/today`.
- `/api/dashboard/rooms/available`, fallback `/api/rooms/available`.
- `/api/dashboard/admissions/active`, fallback `/api/admissions/active`.

Frontend details:

- Widget queries only run if the user has permission to view that module.
- Each widget handles loading, empty, error, retry, and data state.
- Summary cards count available data.

Tests to include:

- Summary cards render.
- Live sections render.
- Errors show friendly retry state.
- Widgets are hidden or skipped based on permission.

## Global Frontend Requirements

### Routing

Public:

- `/`
- `/login`
- `/confirm-email`

Private:

- `/dashboard`
- all module routes.
- `/unauthorized`

Rules:

- Guest routes redirect authenticated users to `/dashboard`.
- Private routes redirect unauthenticated users to `/login`.
- Module routes check `VIEW` or `READ` permissions.
- Unknown routes show not found.

### Layout

The protected app layout must include:

- Sidebar.
- Role-filtered navigation.
- Current user/profile access.
- Language switch.
- Theme toggle.
- Logout.
- Change password flow.
- Responsive mobile navigation.

### API

Current API client must:

- Use base URL from `VITE_API_URL` or `VITE_API_CORE`.
- Send cookies with `withCredentials: true`.
- Add bearer access token when available.
- Refresh on 401.
- Retry original request after refresh.
- Clear session and redirect to login if refresh fails.
- Normalize list responses from `data` or `items`.
- Convert snake_case response keys to camelCase where current helpers do it.
- Convert `sortBy` from camelCase to snake_case for list requests.

### Forms

Every form must:

- Show labels and validation errors.
- Trim text fields before submit where appropriate.
- Strip empty values before submit unless backend needs explicit null.
- Use Zod validation for generic module forms.
- Disable submit while saving.
- Show success toast/message after save.
- Show friendly API error on failure.

### Tables And Lists

Every list must:

- Show loading skeleton.
- Show empty state.
- Show retry state on error.
- Support pagination where configured.
- Support filters from URL search params.
- Preserve filters in URL so refresh/back works.
- Hide actions the user cannot perform.
- Treat API text as text, never as HTML.

### Accessibility

Frontend should:

- Use real buttons for actions.
- Use labels for form controls.
- Use accessible modal semantics.
- Provide disabled/loading state text.
- Avoid inaccessible icon-only actions unless they have labels/tooltips.
- Keep keyboard navigation working in forms, tables, and modals.

## Test Plan

Use:

```bash
npm test
npm run test:watch
npm run test:ui
npm run lint
npm run build
```

For CI or final verification, run:

```bash
npm test
npm run lint
npm run build
```

### Existing Test Coverage Examples

Current tests cover:

- Axios refresh retry and concurrent 401 refresh handling.
- AuthProvider restore, login token memory storage, and logout.
- Router lazy route skeletons and public routes.
- Login rate-limit messaging.
- Confirm email and resend confirmation flow.
- ModulePage create/update/delete toasts, retry UI, detail popup, receptionist payload, empty create action, save error toast.
- API helper query-string and sort mapping.
- Utility normalization and friendly errors.
- AppLayout shell controls and mobile sidebar toggle.
- DataTable API text rendered as inert text.
- Select dropdown positioning.
- EntityFormModal patient and doctor new-user payloads.
- Dashboard retry state.
- Rooms filters, details, admin action hiding.
- Doctors and nurses form validation and admin-only actions.
- Appointments create/list behavior.
- Admissions status filter, unavailable room disabling, create, and discharge.
- Invoices stats, filter, create, pay, and view-only behavior.
- Medical records permission behavior and create form.
- Prescriptions create and view-only behavior.
- Prescription panel create/update/delete/print behavior.

### Tests Required For New Work

For every new frontend feature, add or update tests for:

1. Rendering:
   - Page loads.
   - Required headings and controls appear.
   - Loading, empty, and error states appear.

2. Permissions:
   - Allowed role sees the action.
   - Disallowed role does not see the action.
   - Route guard redirects or denies access.

3. Filters:
   - Filter controls read from URL search params.
   - Changing filters updates URL or query params.
   - API hook/client receives expected filters.

4. CRUD:
   - Create form validates required fields.
   - Create submits expected payload.
   - Edit loads existing data.
   - Update submits expected payload.
   - Delete confirms and calls remove endpoint.
   - Mutations invalidate/refetch list.

5. Backend errors:
   - 400/422 validation error.
   - 401 unauthorized.
   - 403 forbidden.
   - 404 not found.
   - 409 conflict where relevant.
   - 500/server error.
   - Network error.

6. Auth:
   - 401 triggers refresh.
   - Concurrent 401s share one refresh request.
   - Refresh failure clears session.

7. Security:
   - API-provided text renders as text, not HTML.
   - Protected actions are not rendered for unauthorized roles.

8. Accessibility:
   - Inputs have labels.
   - Buttons have accessible names.
   - Modal actions are reachable.

## Backend Contract Needed By Frontend

### Paginated List Response

Preferred:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

Also accepted in many places:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### Auth Response

Preferred:

```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "user-id",
    "firstName": "Ana",
    "lastName": "Krasniqi",
    "email": "ana@example.com",
    "roles": ["ADMIN"]
  }
}
```

### Error Response

Preferred:

```json
{
  "message": "Human readable message"
}
```

Or:

```json
{
  "message": ["First error", "Second error"]
}
```

## Definition Of Done

A frontend task is done when:

- The requested UI exists and is reachable by the correct route.
- Role permissions match `src/config/permissions.ts`.
- CRUD actions call the correct endpoint with the expected payload.
- Filters and pagination work and persist in URL where the pattern requires it.
- Loading, empty, error, retry, success, and read-only states are handled.
- Forms validate before submit.
- Backend errors are shown as friendly messages.
- Tests are added or updated.
- `npm test` passes.
- `npm run lint` passes.
- `npm run build` passes for production readiness.
