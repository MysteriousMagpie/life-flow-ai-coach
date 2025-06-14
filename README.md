
# Life Flow AI Coach

Your intelligent companion for meal planning, task management, workout tracking, and life optimization.

## Project Structure

This repository is split into client and server components:

- `/client/` - React + Vite frontend application
- `/server/` - Express backend server and API routes

## Quick Start

### Prerequisites

Make sure you have pnpm installed:
```bash
# Enable corepack (recommended)
corepack enable

# Or install pnpm globally
npm install -g pnpm@8.15.0
```

### Frontend (Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   pnpm run dev
   ```

The client will be available at `http://localhost:5173`

### Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:
   ```
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   ```

5. Create a `.env` file in the repository root and add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The API server will be available at `http://localhost:3000`

## Development Workflow

1. Start the backend server from the `/server` directory
2. Start the frontend development server from the `/client` directory using pnpm
3. The frontend will make API requests to the backend

## Deployment

### Frontend Deployment (Vercel)

1. Connect your repository to Vercel
2. Set the root directory to `client`
3. Configure environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL` / `SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY` / `SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your deployed backend URL)
4. Deploy automatically on push to main branch

### Backend Deployment (Railway/Render)

#### Using Railway:
1. Connect your repository to Railway
2. Set the root directory to `server`
3. Configure environment variables:
   - `OPENAI_API_KEY`
   - `PORT` (Railway will set this automatically)
   - `CORS_ORIGIN` (your deployed frontend URL)
4. Deploy using the Procfile

#### Using Render:
1. Connect your repository to Render
2. Choose "Web Service"
3. Set the root directory to `server`
4. Build command: `npm install && npm run build`
5. Start command: `npm run start`
6. Configure environment variables in Render dashboard

#### Using Docker:
```bash
cd server
docker build -t life-flow-server .
docker run -p 3000:3000 -e OPENAI_API_KEY=your_key life-flow-server
```

## Database Setup

This project uses Supabase for the database. Make sure to:

1. Create a Supabase project
2. Run the database migrations
3. Configure the environment variables

### Seed Database

To populate your local Supabase project with dummy data:

```bash
pnpm ts-node scripts/seed.ts
```

Make sure to set your `SUPABASE_SERVICE_ROLE_KEY` environment variable before running the seed script.

## Features

- **AI Planning Assistant**: Chat with GPT to plan meals, tasks, and workouts
- **Meal Planning**: Create and manage meal plans with nutrition tracking
- **Task Management**: Organize daily tasks and track progress
- **Workout Planning**: Schedule and track fitness routines
- **Time Blocking**: Plan your day with time-blocked scheduling
- **Reminder System**: Set up important reminders

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for state management
- React Router for navigation
- Package management with pnpm

### Backend
- Express.js
- OpenAI GPT integration
- Supabase for database and authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with `pnpm run test:e2e` (from client directory)
5. Submit a pull request

## License

This project is licensed under the MIT License.
