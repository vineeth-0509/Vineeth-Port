# Portfolio (React + Vite + PostgreSQL) with owner-only admin

Live site: `/`   Admin panel: `/admin` (password protected)
Editable from the admin: **projects** and **experience**.

## Deploy (GitHub → Vercel)
1. Push this whole folder to a GitHub repo.
2. vercel.com → Add New → Project → import the repo → Deploy (Vite is auto-detected).
3. Project → Storage → Marketplace → add a **Postgres** database (e.g. Neon, free plan) → connect it to this project.
   This adds `DATABASE_URL` automatically. (Using your own Postgres? Add `DATABASE_URL` yourself.)
4. Project → Settings → Environment Variables → add `ADMIN_PASSWORD` (long, strong, only you know it).
5. Redeploy once (Deployments → ⋯ → Redeploy).

Tables (`projects`, `experience`) are created automatically on the first request and filled with
the starter content once. See `schema.sql` for the structure.

## Updating content
Open `https://YOUR-SITE.vercel.app/admin`, log in, switch between **Projects** and **Experience**,
add / edit / reorder / delete, then press **Save & publish**. Live instantly — no redeploy.

## Security
Visitors can only read. Saving requires `ADMIN_PASSWORD`, checked on the server, and all values are
passed to PostgreSQL as parameters (no SQL injection). Never put the password in any file.

## Run locally
npm install, then `vercel env pull` and `vercel dev` (needs the Vercel CLI) so /api works.
`npm run dev` alone shows the starter content without a database.
"# 921" 
