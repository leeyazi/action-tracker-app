# Meeting Action Tracker

A single-page app for tracking actions agreed in meetings.

- Add an action with an owner and due date
- Actions grouped by owner, with a tick box for done
- Open / done / overdue counts, with overdue actions highlighted in red

Data is stored in Supabase (project `xbjjmfdmdcdsyplhgqus`, table `public.actions`), so everyone with the link shares one list. Changes appear live in every open browser via Supabase Realtime.

The publishable key in `index.html` is meant to be public. Access is controlled by sign-in plus row level security. Only the "Show done" preference is kept in the browser's `localStorage`.

## Users and sign-in

Users sign in with a **username and password**, stored in Supabase's built-in auth (`auth.users`). Behind the scenes a username maps to the email `<username>@action-tracker.local`; no emails are ever sent.

- **First login:** new users get an initial password and must choose their own (8+ characters, not "password") before they can see any actions.
- **Adding users:** any signed-in user can open **Users**, enter a username and initial password, and click **Add user**. This calls the `admin-create-user` Edge Function ([supabase/functions/admin-create-user](supabase/functions/admin-create-user/index.ts)), which uses the service role key on the server only.
- **Access rule:** only users with a `public.profiles` row who have changed their initial password (`public.is_member()`) can read or write actions. Signed-out visitors and self sign-ups get nothing.
- **Starter accounts:** `priya`, `dan`, `marcus`, all with the initial password `password`.

### `profiles` table

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | primary key, references `auth.users` |
| `username` | text | unique, lowercase |
| `must_change_password` | boolean | `true` until the first password change |
| `created_by` | uuid | who added the user |
| `created_at` | timestamptz | |

Profiles are created by a trigger on `auth.users` for invited accounts only. The initial password hash is kept in `private.initial_passwords` so the "password changed" flag can only be cleared after a real change.

### `actions` table

| column | type | notes |
| --- | --- | --- |
| `id` | uuid | primary key, generated |
| `title` | text | 1–200 chars |
| `owner` | text | 1–60 chars |
| `due` | date | |
| `done` | boolean | default `false` |
| `done_at` | timestamptz | set when ticked |
| `created_at` | timestamptz | default `now()` |
| `created_by` | uuid | signed-in user who added it |

## Deploy on Vercel

1. Import this repository at https://vercel.com/new
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**.

No build step or dependencies are needed — Vercel serves `index.html` as a static site.

## Run locally

Open `index.html` in a browser.
