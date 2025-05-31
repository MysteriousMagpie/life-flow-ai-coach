# Life Flow AI Coach - Client

This is the client-side application for the Life Flow AI Coach project, built with React and Vite.

## Getting Started

### Prerequisites

Make sure you have Node.js and pnpm installed.

### Installation

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

### Running the Application

To start the development server, run:
```bash
pnpm run dev
```

The client will be available at `http://localhost:5173`.

## Project Structure

- `src/` - Contains the source code for the application.
  - `App.tsx` - Main component that sets up routing and layout.
  - `components/` - Reusable components used throughout the application.
  - `pages/` - Different pages of the application.
  - `types/` - TypeScript type definitions.

## Deployment

For deployment instructions, refer to the main README.md file in the root directory.

## Contributing

If you would like to contribute to this project, please follow the guidelines in the main README.md file.