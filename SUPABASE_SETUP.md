# Supabase Setup Guide

## Step 1: Create Supabase Account and Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the project details:
   - **Organization**: Create one if needed
   - **Name**: `impostor` (or your preferred name)
   - **Database Password**: Create a strong password (save it securely!)
   - **Region**: Choose the closest region to you
   - **Pricing Plan**: Free tier is fine for development
5. Click **"Create new project"** and wait 2-3 minutes for it to initialize

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. Copy these three values:

   - **Project URL** → This is your `PUBLIC_SUPABASE_URL`
   - **anon public** key → This is your `PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → This is your `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Step 3: Run the Database Migration

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **"New query"** button (or the "+" icon)
3. Open the file `supabase/migrations/001_initial_schema.sql` from this project
4. Copy the **entire contents** of that file
5. Paste it into the SQL Editor
6. Click the **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
7. You should see a success message like "Success. No rows returned"

## Step 4: Verify Tables Were Created

1. In your Supabase dashboard, click on **Table Editor** in the left sidebar
2. You should see these tables:
   - `categories`
   - `words`
   - `reports`
   - `user_roles`

If you see all four tables, the migration was successful! ✅

## Step 5: Create Your `.env` File

1. In the root of this project, create a file named `.env`
2. Add the following content (replace with your actual values):

```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Replace the placeholder values with the actual values from Step 2

## Step 6: Test the Setup

1. Run `npm install` (if you haven't already)
2. Run `npm run dev`
3. The application should start without errors
4. Navigate to `http://localhost:5173/game` to test the local game mode

## Troubleshooting

### Migration fails with "extension unaccent does not exist"
- This is rare, but if it happens, you may need to enable the extension manually:
  1. Go to **Database** → **Extensions** in Supabase dashboard
  2. Search for "unaccent" and enable it
  3. Then re-run the migration

### Can't find the SQL Editor
- Make sure you're in the correct project
- The SQL Editor is in the left sidebar, usually near the bottom

### Environment variables not working
- Make sure your `.env` file is in the project root (same level as `package.json`)
- Restart your dev server after creating/updating `.env`
- Check that variable names start with `PUBLIC_` for client-side access

## Next Steps

Once Supabase is set up:
- The local game mode works without Supabase (no database needed)
- The API endpoints will work once you have data in the database
- You can add categories and words through the Supabase dashboard or via the API endpoints
