
# Life Flow AI Coach

Your intelligent companion for meal planning, task management, workout tracking, and life optimization.

## Project Structure

This repository is split into client and server components:

- `/client/` - React + Vite frontend application
- `/` (root) - Express backend server and API routes

## Quick Start

### Frontend (Client)

1. Navigate to the client directory:
   ```bash
   cd client
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
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The client will be available at `http://localhost:8080`

### Backend (Server)

1. From the root directory, install dependencies:
   ```bash
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

The API server will be available at `http://localhost:3000`

## Development Workflow

1. Start the backend server from the root directory
2. Start the frontend development server from the `/client` directory
3. The frontend will proxy API requests to the backend

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

### Backend
- Express.js
- OpenAI GPT integration
- Supabase for database and authentication

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
