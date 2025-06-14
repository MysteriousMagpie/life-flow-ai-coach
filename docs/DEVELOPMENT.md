
# Development Guide

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm run dev` | Start the Vite development server (client) |
| `pnpm run build` | Build the project for production (client) |
| `pnpm run preview` | Preview the production build locally (client) |
| `pnpm run lint` | Run ESLint for code quality checks (client) |
| `pnpm test` | Run the unit test suite with Vitest (root) |
| `pnpm run test:e2e` | Run end-to-end tests with Playwright (client) |
| `pnpm run server` | Start the Express backend server |

## Development Workflow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Start the client (from /client directory)
   cd client
   pnpm run dev

   # Terminal 2: Start the server from the repository root
   cd ..
   pnpm run server
   ```

2. **Code Quality**
   ```bash
   # Run linting (from /client directory)
   pnpm run lint

   # Run tests (from repository root)
   pnpm test
   ```

3. **Before Committing**
   ```bash
   # Build to check for errors (from /client directory)
   pnpm run build
   
   # Run E2E tests (from /client directory)
   pnpm run test:e2e
   ```

## Package Management

- **Frontend (Client)**: Uses pnpm for faster installs and better dependency management
- **Backend (Server)**: Uses pnpm as well

### Installing Dependencies

```bash
# Client dependencies
cd client
pnpm add package-name
pnpm add -D dev-package-name

# Server dependencies
pnpm add package-name --workspace-root
pnpm add -D dev-package-name --workspace-root
```

## Development Tips

- Use `console.log` extensively for debugging - logs are visible in the browser console
- The project uses hot module replacement for fast development
- All modules preserve state when switching tabs to avoid losing work
- Use the AI chat interface to test OpenAI integration locally
- pnpm provides faster installs and better disk space usage than npm

## Code Organization

- Keep components small and focused (50 lines or less)
- Create new files for every component or hook
- Use TypeScript strictly - reference type definitions in the codebase
- Follow the existing file structure and naming conventions

## Build Pipeline

The project uses pnpm for both the client and the server:
- Client builds with Vite and pnpm
- Server builds with Node.js and pnpm
- CI/CD uses pnpm for all dependencies
- Vercel deployment automatically detects pnpm via .npmrc
