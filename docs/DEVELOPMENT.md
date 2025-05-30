
# Development Guide

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the project for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm test` | Run the test suite with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run server` | Start the Express backend server |

## Development Workflow

1. **Start Development Environment**
   ```bash
   # Terminal 1: Start the client
   npm run dev
   
   # Terminal 2: Start the server
   npm run server
   ```

2. **Code Quality**
   ```bash
   # Run linting
   npm run lint
   
   # Run tests
   npm test
   ```

3. **Before Committing**
   ```bash
   # Build to check for errors
   npm run build
   
   # Run E2E tests
   npm run test:e2e
   ```

## Development Tips

- Use `console.log` extensively for debugging - logs are visible in the browser console
- The project uses hot module replacement for fast development
- All modules preserve state when switching tabs to avoid losing work
- Use the AI chat interface to test OpenAI integration locally

## Code Organization

- Keep components small and focused (50 lines or less)
- Create new files for every component or hook
- Use TypeScript strictly - reference type definitions in the codebase
- Follow the existing file structure and naming conventions
