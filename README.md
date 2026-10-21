# Meeting Action Tracker

A single-page app for tracking actions agreed in meetings.

- Add an action with an owner and due date
- Actions grouped by owner, with a tick box for done
- Open / done / overdue counts, with overdue actions highlighted in red

Data is saved in the browser's `localStorage`, so each person's list lives in their own browser.

## Deploy on Vercel

1. Import this repository at https://vercel.com/new
2. Framework preset: **Other**. Leave the build command and output directory empty.
3. Click **Deploy**.

No build step or dependencies are needed — Vercel serves `index.html` as a static site.

## Run locally

Open `index.html` in a browser.
