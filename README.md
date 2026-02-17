# Smart Bookmark App

This is a minimal full‑stack web application built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**. It allows users to authenticate via Google OAuth, create personal bookmarks, view them in real time across multiple tabs, and delete them. Bookmarks are **private per user** thanks to row‑level security (RLS) policies in Supabase.

## Features

- **Google OAuth** – only Google login is supported.
- **Bookmark CRUD** – add a bookmark (title + URL), list bookmarks, delete bookmarks.
- **Realtime updates** – when a bookmark is added or removed in one tab, it appears/disappears in other open tabs automatically using Supabase Realtime.
- **User privacy** – each bookmark record includes a `user_id` and RLS policies ensure that users can only read or delete their own bookmarks.
- **Deployment ready** – the project can be deployed to Vercel with a live URL. Environment variables are loaded via `.env`.

## Getting Started Locally

### 1. Clone and install dependencies

```bash
git clone https://github.com/your-username/smart-bookmark-app.git
cd smart-bookmark-app
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your Supabase project details:

```bash
cp .env.example .env.local
# then edit .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

You can find the **Supabase URL** under *Project Settings → Data API → API URL* and the **Publishable key** under *Project Settings → API Keys*.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You should see a login page. Click **Continue with Google** to authenticate. After logging in, you will be redirected to `/app` where you can add, view, and delete your bookmarks.

## Supabase Setup

Create the following table and RLS policies in your Supabase project (SQL can be run in the **SQL Editor**):

```sql
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.bookmarks enable row level security;

create policy "select own bookmarks"
on public.bookmarks
for select
using (auth.uid() = user_id);

create policy "insert own bookmarks"
on public.bookmarks
for insert
with check (auth.uid() = user_id);

create policy "delete own bookmarks"
on public.bookmarks
for delete
using (auth.uid() = user_id);
```

Enable **Realtime** for the `bookmarks` table under **Database → Replication/Realtime** in Supabase.

### Enable Google OAuth

1. In **Authentication → Providers** enable **Google** and add your Google OAuth credentials (Client ID & Client Secret).
2. Under **Authentication → URL Configuration** set:
   - **Site URL**: `http://localhost:3000` (and your deployed URL when deploying)
   - **Redirect URLs**: `http://localhost:3000/auth/callback` (and `https://your-deploy-url.vercel.app/auth/callback` after deployment)

## Deployment

The app is ready to deploy on Vercel:

1. Push this repository to GitHub.
2. Import the project into Vercel and set the environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Update Supabase Auth settings to include your Vercel domain in **Site URL** and add `https://your-domain.vercel.app/auth/callback` in **Redirect URLs**.

## Problems & Solutions

- **OAuth redirect mismatch** – If Google login fails, ensure that the redirect URL (`/auth/callback`) is present in both Supabase and Google Cloud OAuth settings.
- **RLS returns empty data** – Make sure you run the SQL policies exactly as shown above and that `auth.uid()` matches the `user_id` column when inserting.
- **Realtime doesn’t trigger** – Confirm that the table is enabled under **Replication/Realtime** and that your subscription filter uses the correct `user_id`.

## License

This project is open‑sourced for demonstration and educational purposes.