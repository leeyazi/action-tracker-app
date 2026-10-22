# Meeting Action Tracker

A single-page app for tracking actions agreed in meetings.

- Add an action with an owner and due date
- Actions grouped by owner, with a tick box for done
- Open / done / overdue counts, with overdue actions highlighted in red

Data is stored in Supabase (project `xbjjmfdmdcdsyplhgqus`, table `public.actions`), so everyone with the link shares one list. Changes appear live in every open browser via Supabase Realtime.

The publishable key in `index.html` is meant to be public. Access is controlled by row level security: the table is currently open to anyone with the site link (read, add, edit, delete), with no login. Only the "Show done" preference is kept in the browser's `localStorage`.

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

## Deploy on Vercel

1. Import this repository at https://vercel.com/new
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**.

No build step or dependencies are needed — Vercel serves `index.html` as a static site.

## Run locally

Open `index.html` in a browser.
