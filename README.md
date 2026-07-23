# Customer Portal

Vite + React + TypeScript app for Alessandro Enterprises customers.
Fully rebuilt on Supabase (Auth, Postgres, Realtime) — no mock data,
no custom JWT/WebSocket layer.

## What changed from the previous version

Removed (mock/legacy architecture, replaced by Supabase):
- `src/App.jsx` (old mock dashboard, JS not TS)
- `src/main.jsx` (duplicate of `main.tsx`)
- `src/services/api-client.ts` (custom REST client — replaced by `@supabase/supabase-js`)
- `src/services/auth-service.ts` (custom JWT/localStorage auth — replaced by Supabase Auth)
- `src/services/sync-client.ts` (custom WebSocket sync — replaced by Supabase Realtime)
- `src/services/shared-store.ts` (Zustand mock store — replaced by direct Supabase queries + React state)
- `src/services/notification-service.ts` (EventSource-based notifications — replaced by `useToast` + Realtime)
- `src/components/Dashboard.tsx`, `src/components/NotificationCenter.tsx` (old mock versions)
- Top-level `Pages/` folder (empty stub files) — real pages now live in `src/pages/`
- Top-level `.txt` placeholder files (`App.tsx.txt`, `supabaseClient.ts.txt`, `Pages/*.tsx.txt`)

## Structure

```
src/
  components/    Navbar, ProtectedRoute, ToastContainer, NotificationCenter
  pages/         Home, Login, Register, Profile, Products, Promotions,
                 Booking, Messages, Requests, Emails
  hooks/         useAuth, useToast, useRealtimeTable
  services/      customers, services, bookings, messages, requests,
                 emails, promotions (thin Supabase query wrappers)
  types/         shared TypeScript interfaces matching the DB schema
  supabaseClient.ts
  App.tsx
  main.tsx
```

## Setup

```bash
npm install
```

Fill in `.env.local` with your Supabase project's URL and anon key
(Project Settings → API in the Supabase dashboard):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Apply the database schema (see `../supabase/migrations/0001_init.sql`)
to your Supabase project via the SQL editor or `supabase db push`.

## Run

```bash
npm run dev
```

## Integration checklist notes

- **Auth ↔ customers.id (Priority 3):** `customers.id` is a foreign key
  directly to `auth.users(id)` (see migration), so `auth.uid() === customers.id`
  by design — no separate `auth_user_id` lookup is needed, and
  `customer_id: user.id` in the booking/message/request/email inserts is safe.
- **RLS insert policies (Priority 4):** every customer-writable table
  (bookings, messages, requests, emails) has an explicit `insert` policy
  scoped to `auth.uid() = customer_id`, so writes won't silently fail.
- **Error handling (Priority 16):** every Supabase call site logs
  `console.error` on failure before surfacing a user-facing message.
- **Notification Center (Priority 15):** listens for booking created,
  message received, request submitted, and promotion activated via
  Realtime — no `any` casts, typed against `src/types`. Email is
  intentionally excluded from this list per the checklist and instead
  gets its own inline confirmation on the Emails page.
- **Routing (Priority 19):** unmatched routes render `NotFound` (404).
- **TypeScript (Priority 18):** no `any` anywhere in `src/`, no duplicate
  interface names.

- **Email confirmation (Issue 16):** Option A is used — email confirmation
  is required before login. `Register.tsx` shows a "check your email" screen
  after signup instead of logging the user in immediately. If you disable
  email confirmation in Supabase Auth settings, update that screen to redirect
  straight to `/login` instead.
- **Signup → profile race condition (Issue 2):** the `customers` row is
  created by the database trigger, not by the client — the client never
  inserts into `customers` directly (this was deliberate, see Issue 3/1 notes
  in prior reviews: a duplicate client-side insert would race the trigger).
  Since the trigger runs asynchronously relative to the client, login and
  `Profile.tsx` use `getCustomerWithRetry` (`src/services/customers.ts`),
  which polls briefly (5 attempts, 600ms apart) before continuing. If the
  profile cannot be verified, login stops with a clear retry message.
- **Realtime page refresh (Issue 8):** the dashboard refreshes for booking,
  service, and promotion changes. Messages, Requests, Emails, and Promotions
  refresh their own data when their corresponding table changes.

## Production migration verification

Applying `../supabase/migrations/0001_init.sql` requires access to the target
Supabase project, so it must be performed during deployment. After `supabase
db push` (or running the file in the SQL editor), verify the tables, RLS
policies, foreign keys, publication membership, and `on_auth_user_created`
trigger in the Supabase dashboard before release. Do not add a client-side
`customers` insert: `handle_new_customer` is the sole customer-row creator.

## Notes

- Auth: Supabase Authentication (email/password). A Postgres trigger
  (`handle_new_customer`) auto-creates a `customers` row when a user signs up.
- Admin users are distinguished via `app_metadata.role = "admin"` on their
  Supabase auth user — set this from the Supabase dashboard or via the
  service role key on the backend. Regular customers never get this claim.
- Realtime: `NotificationCenter` subscribes to `bookings`, `messages`,
  `requests`, and `promotions` changes and surfaces them as toasts.
- All new resources (bookings, messages, requests, emails) default to
  `Pending` / `Sent` / `Open` status per the spec.
