
# Testing Guide

## Unit Tests

### Running Tests
```bash
# From /client directory

# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Test Structure
- Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions
- Use Vitest for unit testing
- Focus on testing business logic and utilities

## End-to-End Tests

### Setup
```bash
# From /client directory

# Install dependencies (includes Playwright)
pnpm install

# Install Playwright browsers
npx playwright install

# Run e2e tests
pnpm run test:e2e

# Run e2e tests with UI
pnpm run test:e2e -- --ui
```

### E2E Test Configuration

Set up environment variables for testing:
```bash
# .env.local (for local testing in /client directory)
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_key
```

### Test Coverage

Current E2E tests cover:
- User registration and authentication
- AI chat functionality with meal planning
- Data persistence verification
- Core navigation flows

### Writing Tests

- Use the test helpers in `e2e/test-helpers.ts`
- Follow the existing test patterns
- Test critical user journeys end-to-end
- Use data attributes for reliable element selection

## CI/CD Testing

Tests run automatically on:
- Every push to main branch
- Every pull request
- Uses GitHub Actions with pnpm for faster CI builds
- Includes pnpm caching for improved performance

### CI Environment

The CI pipeline uses:
- pnpm@8 for package management
- Node.js 18
- Playwright for E2E testing
- Proper environment secrets for testing

## Package Management in Tests

- Use `pnpm install --frozen-lockfile` for deterministic installs
- Playwright browsers are cached across CI runs
- Dependencies are installed only in the client directory for frontend tests
