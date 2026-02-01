# Impostor Game

A web-based deduction game where players try to identify the impostor. Players receive a category and a secret word (except the impostor who only knows the category). Through discussion and clues, players must figure out who doesn't know the word.

**Play now:** https://impostor-ivory.vercel.app/

Feedback is welcome!

## Game Rules

### Setup
1. **Add Players**: Minimum 3 players required
2. **Select Category**: Choose from available categories
3. **Start Game**: The game randomly selects one player as the impostor

### Gameplay
1. **Private Reveal**: Each player privately views their role and word (impostor sees only the category)
2. **Discussion Phase**: Players take turns giving clues about their word without saying it directly
3. **Accusations**: Players can accuse others of being the impostor
4. **Voting Phase**: Once all accusations are made, players vote on who they think is the impostor
5. **Results**: The game reveals the impostor and whether they were caught

### Winning Conditions
- **Players Win**: If the majority votes correctly identify the impostor
- **Impostor Wins**: If the impostor avoids detection

## Architecture

### Tech Stack
- **Frontend/Backend**: SvelteKit (TypeScript)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Hosting**: Vercel (recommended)

### Project Structure
```
impostor/
├── src/
│   ├── lib/
│   │   ├── supabase/          # Supabase client configuration
│   │   │   ├── client.ts       # Browser client
│   │   │   ├── server.ts       # Server client
│   │   │   ├── admin.ts        # Admin client (bypasses RLS)
│   │   │   └── database.types.ts
│   │   ├── game/               # Game logic
│   │   │   ├── local-mode.ts   # Local game state management
│   │   │   └── types.ts        # Game type definitions
│   │   └── components/         # UI components
│   │       ├── SetupScreen.svelte
│   │       ├── RevealScreen.svelte
│   │       ├── GameScreen.svelte
│   │       ├── VotingScreen.svelte
│   │       └── ResultsScreen.svelte
│   ├── routes/
│   │   ├── api/                # API endpoints
│   │   │   ├── categories/
│   │   │   ├── words/
│   │   │   └── reports/
│   │   ├── game/               # Game route
│   │   └── +layout.server.ts
│   ├── hooks.server.ts         # SvelteKit hooks
│   └── app.d.ts                # TypeScript definitions
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── README.md
```

## Database Schema

### Tables
- **categories**: Game categories (name, description, approved status)
- **words**: Words associated with categories (word, category_id, approved status)
- **reports**: User reports for inappropriate content
- **user_roles**: Admin and moderator roles

### Row Level Security (RLS)
- **Public Read**: Approved categories and words are publicly readable
- **Authenticated Insert**: Authenticated users can propose new categories/words
- **Admin Only**: Only admins can approve/modify content and manage user roles

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tomas-mazzocchi/impostor.git
   cd impostor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   PUBLIC_SUPABASE_URL=your_supabase_project_url
   PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```
   
   Get these values from your Supabase project settings:
   - Go to Project Settings → API
   - Copy the Project URL → `PUBLIC_SUPABASE_URL`
   - Copy the anon/public key → `PUBLIC_SUPABASE_ANON_KEY`
   - Copy the service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret!)

4. **Set up the database**
   
   Run the migration in your Supabase project:
   - Go to SQL Editor in Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL script

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to `http://localhost:5173` in your browser

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run type checking
- `npm run test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

### Testing

The project uses [Vitest](https://vitest.dev/) for testing with [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/) for component tests.

**Test files location:**
- `src/lib/game/local-mode.test.ts` - Unit tests for game logic (role assignment, scoring, round management)
- `src/lib/components/RoundQuestionnaire.test.ts` - Component tests for the round questionnaire navigation

**Running tests:**
```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch
```

### Local Mode
The game currently supports local mode (single device). Players pass the device around to view their roles privately. No network connection is required for local gameplay.

### Future Features
- Admin moderation endpoints
- Seed data (Argentinian categories)
- Realtime multiplayer mode (Supabase Realtime)
- User authentication
- Content moderation UI

## API Endpoints

### Categories
- `GET /api/categories` - Get all approved categories
- `GET /api/categories/:id/words` - Get words for a category
- `POST /api/categories/propose` - Propose a new category (requires auth)

### Words
- `POST /api/words/propose` - Propose a new word (requires auth)

### Reports
- `POST /api/reports` - Report inappropriate content (requires auth)

## Deployment to Vercel (Free)

### Quick Deploy

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Install the Vercel adapter** (if not already installed):
   ```bash
   npm install
   ```

3. **Go to [vercel.com](https://vercel.com)** and sign in

4. **Import your repository**:
   - Click "Add New..." → "Project"
   - Select your repository
   - Vercel will auto-detect SvelteKit

5. **Configure Environment Variables**:
   In Vercel project settings → Environment Variables, add:
   - `PUBLIC_SUPABASE_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

6. **Deploy**: Click "Deploy" and wait 2-3 minutes

7. **Run database migrations**:
   - Go to Supabase SQL Editor
   - Run `supabase/migrations/001_initial_schema.sql`
   - Run `supabase/migrations/002_seed_sample_data.sql`

Your app will be live at `your-project.vercel.app`!

For detailed instructions, see [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]
