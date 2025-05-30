
# Testing Guide

## Unit Tests

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- Tests are located alongside source files with `.test.ts` or `.test.tsx` extensions
- Use Vitest for unit testing
- Focus on testing business logic and utilities

## End-to-End Tests

### Setup
```bash
# Install Playwright browsers
npx playwright install

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e -- --ui
```

### E2E Test Configuration

Set up environment variables for testing:
```bash
# .env.local (for local testing)
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
- Uses GitHub Actions with proper environment secrets
