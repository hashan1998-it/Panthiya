# Tuition Class Management System — Project Plan

A web app for a tuition teacher to manage students, classes, attendance and fees, with a read-only portal for students.

**Purpose of the project:** portfolio piece for frontend software engineer applications.
**Built by:** me, manually, task by task. This document is the backlog.

---

## 1. Decisions

| Topic | Decision |
|---|---|
| Framework | Next.js (App Router) + TypeScript (strict) |
| Styling / UI | Tailwind CSS + shadcn/ui |
| Visual design | [DESIGN.md](DESIGN.md), based on the Cal.com design analysis, adapted for a dashboard with dark mode and Sinhala |
| Backend | Supabase (Postgres, Auth, Row Level Security) from day one |
| Roles | Admin and Student |
| Student accounts | Created by the admin only. No public sign-up |
| Fee model | Fixed monthly fee per class, with per-enrollment discounts |
| Extra features | Reports + charts, CSV export + receipts, timetable calendar, Sinhala/English, dark mode |
| Testing | Vitest + React Testing Library (unit/component), Playwright (E2E) |
| Workflow | One feature branch per task, merged through a pull request, CI on every push |
| Hosting | Vercel |
| Timezone | All "today" and "this month" logic uses `Asia/Colombo`, never the server's clock (Vercel runs in UTC) |
| Time budget | Full time, about 3 weeks |

## 2. Users and permissions

| Capability | Admin | Student |
|---|---|---|
| Manage students, classes, enrollments | Yes | No |
| Mark attendance | Yes | No |
| Record payments, issue receipts | Yes | No |
| See reports and exports | Yes | No |
| See own classes, attendance, payments, receipts | n/a | Yes (read-only) |
| Change own password, language, theme | Yes | Yes |

Permissions are enforced in the database with Row Level Security. Hiding a button in the UI is not security.

## 3. Features

### Core
- **Auth:** email + password login, logout, role-based redirect, protected routes.
- **Students:** list with search, grade filter, sort, pagination. Add, edit, deactivate. Profile page.
- **Classes:** subject, grade, day of week, start/end time, monthly fee. Enroll and unenroll students.
- **Attendance:** pick a class and a date, mark each enrolled student present / absent / late. History per class and per student.
- **Fees:** monthly dues generated per enrollment, record payments, list of unpaid students.
- **Discounts:** per enrollment: none, half card (50%), free card (100%), custom percentage (for example sibling discount).
- **Dashboard:** active students, today's classes, this month's collected and outstanding fees.

### Extras
- **Reports:** attendance rate per class, income per month, students per class.
- **Export:** CSV for students, attendance and payments. Printable fee receipt.
- **Timetable:** weekly calendar grid of all classes.
- **i18n + theme:** Sinhala / English switch, light / dark mode.

### Out of scope
Online payments, SMS/WhatsApp notifications, exams and marks, multiple teachers, parent accounts.

## 4. Data model

```
profiles     id (= auth.users.id), role ('admin' | 'student'), full_name,
             locale ('en' | 'si', default 'en'), created_at

students     id, profile_id -> profiles (nullable until an account exists, unique),
             admission_no (unique), full_name, grade, phone,
             parent_name, parent_phone, joined_on, is_active

classes      id, subject, grade, day_of_week (0-6), start_time, end_time,
             monthly_fee numeric(10,2), is_active

enrollments  id, student_id -> students, class_id -> classes,
             discount_type ('none' | 'half' | 'free' | 'custom'),
             discount_percent (0-100), enrolled_on, ended_on (nullable)
             unique (student_id, class_id)
             check: none -> 0, half -> 50, free -> 100, custom -> 1-99

attendance   id, class_id -> classes, student_id -> students, session_date,
             status ('present' | 'absent' | 'late')
             unique (class_id, student_id, session_date)

dues         id, enrollment_id -> enrollments, month (first day of month),
             amount_due numeric(10,2), created_at
             unique (enrollment_id, month)

payments     id, due_id -> dues, amount numeric(10,2) (> 0), paid_on, method,
             receipt_no (unique, from a Postgres sequence), voided_at (nullable)
```

**Money:** always `numeric`, never `float`. Format through one shared formatter.

**Fee rule:** `amount_due = monthly_fee * (100 - discount_percent) / 100`. It is stored on the `dues` row at generation time, so changing a class fee later does not rewrite history.

**Due status:** derived, not stored. `paid` = sum of non-voided payments >= `amount_due` (a due of 0 counts as paid), `partial` = some paid but less than due, `unpaid` = nothing paid. One due can have several payments, each with its own receipt.

**Unenroll:** sets `ended_on`; the row is never deleted, so attendance and payment history stays. An enrollment is active when `ended_on` is null. No foreign key here uses `on delete cascade`.

**One day per class:** a class meets once a week on `day_of_week`. A subject taught twice a week is two classes. This is deliberate to keep attendance and fees simple.

**RLS summary:**
- Admin can read and write everything.
- A student can only `select` rows that belong to their own `students` record.
- The only student write: `update` of their own `profiles` row, limited to the `locale` column (column-level grant). A student can never change `role`.
- Role checks use a `security definer` function `is_admin()` (or a JWT claim), not a direct sub-query on `profiles` inside a `profiles` policy, which causes infinite recursion.

## 5. Routes

```
/login

(admin)
/dashboard
/students                 /students/new        /students/[id]      /students/[id]/edit
/classes                  /classes/new         /classes/[id]       /classes/[id]/edit
/attendance               /attendance/[classId]?date=YYYY-MM-DD
/fees                     /fees/receipt/[paymentId]
/timetable
/reports
/settings

(student)
/me                       overview
/me/attendance
/me/payments
```

## 6. Tech stack

| Concern | Choice |
|---|---|
| Data access | `@supabase/ssr`. Reads in Server Components, writes in Server Actions |
| Validation | Zod schemas shared between forms and Server Actions |
| Forms | React Hook Form + shadcn `Form` |
| Tables | TanStack Table + shadcn `Table` |
| Charts | Recharts (shadcn chart components) |
| i18n | next-intl |
| Theme | next-themes |
| Dates | date-fns |
| Toasts | sonner |
| Lint / format | ESLint + Prettier |
| DB types | generated with `supabase gen types typescript` |

## 7. Folder structure

```
src/
  app/
    (auth)/login/
    (admin)/dashboard/ students/ classes/ attendance/ fees/ timetable/ reports/ settings/
    (student)/me/
  components/
    ui/            shadcn components
    layout/        sidebar, header, theme and language switchers
    shared/        data-table, page-header, empty-state, confirm-dialog
  features/
    students/      components, actions.ts, queries.ts, schema.ts
    classes/  attendance/  fees/  reports/
  lib/
    supabase/      server.ts, client.ts, middleware.ts
    utils.ts  fees.ts  dates.ts  csv.ts
  messages/        en.json, si.json
  types/           database.ts (generated)
supabase/
  migrations/      SQL files
  seed.sql
e2e/
```

## 8. Workflow

1. Pick the next task. Create a branch: `feat/T-012-students-list`.
2. Build it. Commit in small steps using Conventional Commits (`feat:`, `fix:`, `test:`, `chore:`).
3. Open a pull request. The description says what changed and includes a screenshot for UI work.
4. CI must be green. Ask Claude for a review, fix the comments, then merge.
5. Tick the task in this file.

### Definition of done (applies to every task)
- All acceptance criteria met.
- No TypeScript or ESLint errors. No `any`.
- Loading, empty and error states handled for every data view.
- Works at 375px wide and on desktop.
- UI follows [DESIGN.md](DESIGN.md): tokens only, no hard-coded hex values, sizes or radii.
- Usable with keyboard only. Form fields have labels.
- All visible text comes from the translation files (from T-023 onwards).

---

## 9. Backlog

Size: **S** = under 2 hours, **M** = half a day, **L** = a full day.

**Cut if late:** tasks or criteria marked *(cut if late)* are the first to drop or move to "Later" if the schedule slips. The budget is tight for 3 weeks.

### Phase 0 — Setup (day 1)

- [ ] **T-001 Create the project** (S)
  - Next.js app with TypeScript, Tailwind, ESLint, App Router and the `src/` directory.
  - `strict` is on in `tsconfig.json`. Path alias `@/*` works.
  - Git repository initialised and pushed to GitHub with a sensible `.gitignore`.

- [ ] **T-002 Tooling** (S)
  - Prettier configured with the Tailwind plugin. `npm run lint`, `npm run typecheck` and `npm run format` exist and pass.
  - shadcn/ui initialised. `Button` renders on the home page.

- [ ] **T-006 Design tokens** (M) — do this right after T-002
  - Light and dark colour tokens from DESIGN.md section 2 are set as shadcn CSS variables in `globals.css`, including `--body`, `--success`, `--warning` and a text-shade variable for every badge colour. `--radius` is `0.5rem`.
  - Inter, Noto Sans Sinhala and JetBrains Mono load through `next/font` with no layout shift.
  - next-themes is installed with `attribute="class"`, so both themes can be checked from day one. (The user-facing switch comes in T-081.)
  - A temporary `/styleguide` page shows buttons, input, badges for every status, a card and the type scale in both themes.
  - Body text and muted text pass WCAG AA contrast in both themes.

- [ ] **T-003 CI pipeline** (S)
  - GitHub Actions workflow runs lint, typecheck and build on every push and pull request.
  - A deliberately broken commit on a test branch turns the check red.
  - `main` is protected: merging requires a green check.

- [ ] **T-004 Supabase project** (S)
  - Supabase project created. URL and anon key are in `.env.local`. `.env.example` lists the variable names without values.
  - Supabase CLI installed and linked. Server and browser clients exist in `lib/supabase/`.
  - No secret key is committed. The service role key is never imported in a client component.

- [ ] **T-005 Deploy the skeleton** (S)
  - App is live on Vercel with environment variables set.
  - Every pull request gets a preview URL.

### Phase 1 — Database and auth (days 2-3)

- [ ] **T-010 Schema migration** (M)
  - All seven tables from section 4 created through a migration file, with foreign keys, unique constraints and check constraints (for example `discount_percent between 0 and 100` and the discount type / percent match).
  - A receipt number sequence exists. No foreign key cascades deletes.
  - Running the migrations on an empty database succeeds.
  - TypeScript types are generated into `types/database.ts` and there is an npm script for it.

- [ ] **T-011 Row Level Security** (M)
  - RLS enabled on every table. Admin checks go through a `security definer` `is_admin()` function.
  - Signed in as a student, querying `students`, `attendance`, `dues` and `payments` returns only that student's rows. Insert, update and delete are rejected.
  - A student can update `locale` on their own profile, and an attempt to change `role` is rejected.
  - Signed in as admin, all rows are readable and writable.
  - A signed-out request returns nothing.

- [ ] **T-012 Seed data** (S)
  - `seed.sql` creates 1 admin, about 30 students, 6 classes, enrollments with a mix of discounts (including one ended enrollment), 2 months of attendance, dues and payments (including one partial payment).
  - Resetting the local database produces the same data every time.

- [ ] **T-013 Login page** (M)
  - Email + password form validated with Zod. Wrong credentials show an inline error, not a crash.
  - The submit button shows a pending state and cannot be double-submitted.
  - After login, admin lands on `/dashboard` and a student lands on `/me`.

- [ ] **T-014 Route protection** (M)
  - Signed-out users visiting any app route are redirected to `/login`.
  - A student who types `/students` in the address bar is redirected to `/me`. An admin visiting `/me` is redirected to `/dashboard`.
  - Signed-in users visiting `/login` are redirected to their home page.
  - Logout clears the session and returning with the back button does not show protected content.

### Phase 2 — App shell (day 4)

- [ ] **T-020 Admin layout** (M)
  - Sidebar with links to every admin section. The active link is highlighted.
  - Below 768px the sidebar becomes a slide-in drawer opened from a menu button. From 768 to 1024px it collapses to icons only, with tooltips.
  - Header shows the user's name and a menu with Settings and Logout.

- [ ] **T-021 Shared building blocks** (M)
  - `PageHeader` (title, description, action slot), `EmptyState`, `ConfirmDialog` and a route-level `loading.tsx` skeleton and `error.tsx` with a retry button.
  - Toasts work for success and failure.
  - A `not-found.tsx` page exists.

- [ ] **T-022 Reusable data table** (L)
  - Generic, typed `DataTable<T>` built on TanStack Table: column sorting, pagination, a search input and a slot for filters.
  - Search, sort, filter and page are stored in the URL, so a refresh or a shared link shows the same view.
  - On mobile the table scrolls horizontally without breaking the page layout.

- [ ] **T-023 i18n foundation** (M)
  - next-intl set up with `en.json` (and an empty `si.json`). Every string in the app so far moves into `en.json`.
  - Zod error messages and toasts go through the translation function.
  - `lib/dates.ts` has helpers for "today" and "current month" in `Asia/Colombo`, with unit tests around midnight UTC (05:30 in Sri Lanka).
  - From here on no task adds a hard-coded user-facing string. Doing this now avoids refactoring every page in Phase 8.

### Phase 3 — Students (days 5-6)

- [ ] **T-030 Students list** (M)
  - Shows admission number, name, grade, phone and status. Search by name or admission number, filter by grade and status.
  - Search is debounced. Filtering happens in the database, not in the browser.
  - Empty state when there are no students and a different one when a search has no results.

- [ ] **T-031 Add student** (M)
  - Form with all `students` fields. Zod validates required fields and a Sri Lankan phone number format.
  - The same schema validates again inside the Server Action.
  - A duplicate admission number shows an error on that field.
  - On success: toast, redirect to the new profile, and the list shows the new student.

- [ ] **T-032 Edit and deactivate student** (S)
  - The edit form reuses the add form component, pre-filled.
  - Deactivate asks for confirmation. Deactivated students are hidden by default but their history is kept.

- [ ] **T-033 Student profile** (M)
  - Shows details, enrolled classes with discount, attendance rate and payment history in tabs.
  - An unknown id shows the not-found page.

- [ ] **T-034 Create student login** (M)
  - A button on the profile creates an auth account for the student and links it through `profile_id`.
  - It runs on the server only, using the service role key.
  - The button is replaced by an "Account active" state once an account exists. Creating a second account for the same student is impossible.
  - The new student can log in and sees only their own data.

- [ ] **T-035 Tests for students** (M)
  - Vitest and React Testing Library are set up and run in CI.
  - Unit tests for the student Zod schema (valid and invalid cases).
  - Component test: submitting the empty form shows the required-field errors.

### Phase 4 — Classes and enrollment (days 7-8)

- [ ] **T-040 Classes list and form** (M)
  - List shows subject, grade, day, time, fee and enrolled count.
  - Add and edit form. End time must be after start time. Fee must be positive.
  - Fees are displayed as `Rs. 2,500.00` everywhere through one shared formatter.

- [ ] **T-041 Class detail** (M)
  - Shows class information and the enrolled students with their discount type and effective fee.

- [ ] **T-042 Enroll students** (L)
  - A dialog with a searchable list of students who are not already in the class. Multiple students can be selected and enrolled at once.
  - Discount type is chosen per enrollment. Choosing "custom" reveals a percentage input.
  - Unenroll asks for confirmation, sets `ended_on` and keeps past attendance and payments. Re-enrolling the same student clears `ended_on` instead of inserting a new row.
  - The enrolled count updates without a full page reload.

- [ ] **T-043 Fee calculation module** (S)
  - A pure function in `lib/fees.ts` returns the amount due for a fee and a discount.
  - Unit tests cover none, half, free, custom, 0%, 100% and rounding.

### Phase 5 — Attendance (days 9-10)

- [ ] **T-050 Attendance entry** (L)
  - Choose a class and a date. The date picker only allows days that match the class's day of week and never a future date.
  - Every enrolled student is listed with present / absent / late controls. "Mark all present" exists.
  - Saving is an upsert: opening the same class and date again shows the saved values and editing them does not create duplicates.
  - The UI updates optimistically and rolls back with an error toast if the save fails.
  - Leaving the page with unsaved changes shows a warning.

- [ ] **T-051 Attendance history** (M)
  - Per class: a grid of students by session dates with a status mark in each cell and a percentage per student.
  - Per student: shown in the profile's attendance tab.
  - A month selector limits the range.

- [ ] **T-052 Tests for attendance** (S)
  - Unit tests for the helper that lists valid session dates for a class in a month.
  - Unit tests for the attendance percentage calculation, including zero sessions.

### Phase 6 — Fees (days 11-12)

- [ ] **T-060 Generate monthly dues** (M)
  - A "Generate dues" action for a chosen month creates one `dues` row per active enrollment (`ended_on` is null) with the correct `amount_due`.
  - Running it twice for the same month creates no duplicates (`insert ... on conflict do nothing`).
  - Enrollments with a free card get a row with `amount_due = 0` that counts as paid.

- [ ] **T-061 Fees page** (L)
  - Month selector, class filter and status filter (paid / partial / unpaid / all). Totals for due, collected and outstanding are shown above the table.
  - "Record payment" opens a dialog with amount (defaults to the remaining balance, can be less), date and method. Each payment gets a receipt number from the database sequence.
  - A payment can be voided by the admin, with confirmation. Voiding sets `voided_at`; the row and its receipt number are kept.

- [ ] **T-062 Receipt** (M)
  - `/fees/receipt/[paymentId]` shows a clean receipt: receipt number, student, class, month, amount, date.
  - The print view hides the sidebar and header and fits on one A5 or A4 page.
  - A student can open receipts for their own payments only.

- [ ] **T-063 Unpaid list** (S)
  - A view of students with outstanding dues, including how many months are overdue, sorted by the highest amount.

### Phase 7 — Dashboard, reports, timetable (days 13-15)

- [ ] **T-070 Dashboard** (M)
  - Cards: active students, classes today, collected this month, outstanding this month. "Today" and "this month" use `Asia/Colombo`.
  - Today's classes list links to that class's attendance page for today.
  - Each section loads independently with its own skeleton (Suspense), so one slow query does not block the page.

- [ ] **T-071 Reports** (L)
  - Charts: income per month for the last 6 months, attendance rate per class, students per class.
  - Aggregation happens in SQL (view or RPC), not by loading all rows into the browser.
  - Charts are readable in dark mode and have a text alternative for screen readers.

- [ ] **T-072 Weekly timetable** (L)
  - A 7-column weekly grid with time on the vertical axis. Each class is a block positioned by start time and sized by duration.
  - Overlapping classes are shown side by side, not on top of each other. *(cut if late)*
  - On mobile it switches to one day at a time with a day selector.
  - Clicking a block opens the class detail.

- [ ] **T-073 CSV export** (M)
  - Export buttons on students, attendance history and fees. The file respects the active filters.
  - Sinhala text and commas inside values open correctly in Excel (UTF-8 BOM, quoted fields).
  - Unit tests for the CSV serialiser.

### Phase 8 — Student portal, i18n, theme (days 16-17)

- [ ] **T-080 Student portal** (M)
  - `/me` shows the student's classes, next class, attendance rate and unpaid dues.
  - `/me/attendance` and `/me/payments` show history with a link to each receipt.
  - There are no edit controls anywhere in the portal.

- [ ] **T-081 Dark mode** (S)
  - Light / dark / system switch. The choice persists and there is no flash of the wrong theme on load.
  - Every page checked in dark mode for contrast.

- [ ] **T-082 Sinhala translation** (M)
  - `si.json` is complete. A language switch in the header saves to `profiles.locale`.
  - A check (script or test) fails if `si.json` is missing any key from `en.json`.
  - Dates and currency follow the selected locale.
  - Layouts do not break with longer Sinhala text. *(full polish of every page: cut if late)*

- [ ] **T-083 Settings page** (S)
  - Change password, language and theme.

### Phase 9 — Quality and launch (days 18-20)

- [ ] **T-090 E2E tests** (L)
  - Playwright set up against a seeded local database and running in CI. CI starts local Supabase with `supabase start` (Docker), applies migrations and the seed, then runs the tests.
  - Flows covered: admin login, add a student, enroll in a class, mark attendance, record a payment, student login sees only own data, student is blocked from `/students`.

- [ ] **T-091 Accessibility pass** (M)
  - Every page passes an axe scan with no serious or critical issues.
  - All dialogs trap focus and close on Escape. Focus returns to the trigger.
  - The whole add-student flow can be completed with the keyboard only.

- [ ] **T-092 Performance pass** (M)
  - Lighthouse on the deployed login and dashboard pages: Performance 90+, Accessibility 95+, Best Practices 95+.
  - Client components are used only where interactivity needs them. Charts are loaded lazily.

- [ ] **T-093 README and demo** (M)
  - README has: one-paragraph pitch, live link, demo admin and demo student credentials, screenshots or a short GIF, feature list, tech stack, architecture notes (RLS, Server Actions), local setup steps, and what I would do next.
  - The live demo resets its data on a schedule or the demo accounts cannot do damage.

- [ ] **T-094 Final review** (S)
  - No `console.log`, commented-out code or unused dependencies.
  - Every task in this file is ticked or moved to "Later".

---

## 10. Later (not in this plan)

- Parent accounts and SMS/WhatsApp fee reminders
- QR code attendance
- Multiple teachers with their own classes
- PWA with offline attendance marking
- Exam marks and progress reports

## 11. Interview talking points to collect while building

Keep short notes as I go. These are what interviewers ask about.

- Why RLS instead of checking roles only in the UI.
- Why Server Components for reads and Server Actions for writes, and where I still needed client components.
- How URL state made the tables shareable and refresh-safe.
- How optimistic updates and rollback work on the attendance page.
- Why `amount_due` is stored instead of recalculated, and why dues and payments are separate tables.
- How timezones were handled (`Asia/Colombo` vs a UTC server).
- The hardest bug, and how I found it.
