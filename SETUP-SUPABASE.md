# ☀️ Good morning! Turn on voting + admin (~10 minutes)

Everything is built and deployed. The live site currently serves the bundled seed data;
these steps connect the database, which switches on **voting** and the **admin console**.

## 1. Create the Supabase project (~3 min)

1. Go to **supabase.com** → sign in (GitHub `judy-eapen` is easiest) → **New project**
2. Name: `cruise-crew-planner` · Region: US East · set any strong DB password (you won't need it again) → **Create**
3. Wait ~1 minute for it to provision

## 2. Create the tables (~1 min)

1. In the Supabase left sidebar: **SQL Editor** → **New query**
2. Open `supabase/schema.sql` from this repo, paste the whole thing, click **Run**
3. You should see "Success. No rows returned"

## 3. Get your two keys (~1 min)

In Supabase: **Project Settings (gear) → API Keys**

- **Project URL** — looks like `https://abcdefgh.supabase.co`
- **service_role key** (under "Project API keys" — click reveal). ⚠️ This one is secret — it never goes in
  the browser, only in server env vars.

## 4. Add environment variables to Vercel (~3 min)

Go to **vercel.com → cruise-crew-planner → Settings → Environment Variables** and add three
(leave "All Environments" checked):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | the service_role key |
| `ADMIN_PASSCODE` | a passcode you choose (this unlocks /admin — pick something you can type on your phone) |

Then **Deployments** tab → ⋯ on the latest deployment → **Redeploy** (env vars apply on the next deploy).

*Optional, for local dev too: add the same three lines to `.env.local` in the project folder (see `.env.example`).*

## 5. Seed the database (~1 min)

1. Open **https://cruise-crew-planner.vercel.app/admin**
2. Enter your passcode → **Seed database**
3. The status pill flips to "● database connected"

## 6. Sanity check (~1 min)

- Main app still shows all six options (now served from the DB)
- Admin → **Family vote links** shows 7 links — click **Copy link** on one, open it in a private
  browser window, cast a test vote
- The **Vote** tab on the main app now shows the live tally

## That's it 🎉

From here on:
- **Price updates** happen in /admin (flights stamp today's date and drop the ~ estimate marker)
- **Real family names/counts** → admin → Families section
- **Vote links** → DM each family their own link (never post them in the shared chat)
- A test vote can be overwritten by just voting again from the same link — one vote per family, always editable
