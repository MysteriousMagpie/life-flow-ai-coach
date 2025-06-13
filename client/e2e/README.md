
# Life Flow AI Coach - End-to-End Tests

This directory contains comprehensive end-to-end tests for the Life Flow AI Coach application using Playwright.

## Test Structure

### Test Suites

- **`auth.spec.ts`** - User authentication flows
  - Sign up, sign in, sign out
  - Validation and error handling
  - Session persistence

- **`ai-coaching.spec.ts`** - AI interaction scenarios
  - Meal planning requests
  - Workout scheduling
  - Task management
  - Quick suggestions
  - Complex multi-step planning

- **`dashboard.spec.ts`** - Dashboard functionality
  - Widget display and updates
  - Stats and progress tracking
  - Responsive design
  - Real-time updates

- **`profile-settings.spec.ts`** - Profile and settings management
  - User preferences
  - Notification settings
  - Theme switching
  - Data persistence

- **`integration.spec.ts`** - Cross-feature workflows
  - Complete daily planning
  - Meal-to-shopping workflows
  - Schedule optimization
  - Data persistence across sessions

### Helper Classes

- **`test-helpers.ts`** - Comprehensive utility class with methods for:
  - Authentication operations
  - AI chat interactions
  - Navigation helpers
  - Verification methods
  - Test data generation

## Running Tests

### All Tests
```bash
pnpm test:e2e
```

### Specific Test Suites
```bash
pnpm test:auth          # Authentication tests only
pnpm test:ai            # AI coaching tests only
pnpm test:dashboard     # Dashboard tests only
pnpm test:profile       # Profile/settings tests only
pnpm test:integration   # Integration workflow tests only
```

### Interactive Mode
```bash
pnpm test:e2e:ui        # Run with Playwright UI
pnpm test:e2e:headed    # Run in headed mode
pnpm test:e2e:debug     # Run in debug mode
```

## Test Configuration

### Browsers
Tests run on:
- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)

### Timeouts
- Test timeout: 30 seconds
- Expect timeout: 10 seconds
- Navigation timeout: 15 seconds

### Retry Strategy
- CI: 2 retries on failure
- Local: No retries (fail fast)

### Screenshots and Videos
- Screenshots: Only on failure
- Videos: Retained on failure
- Traces: On first retry

## Best Practices Implemented

### 1. Page Object Pattern
- Centralized helpers in `test-helpers.ts`
- Reusable methods for common operations
- Clear abstraction of UI interactions

### 2. Test Isolation
- Each test is independent
- Fresh user account per test
- Clean state initialization

### 3. Reliable Selectors
- Prefer `data-testid` attributes
- Semantic text selectors as fallback
- Stable element identification

### 4. Waiting Strategies
- Explicit waits for elements
- Custom wait functions for AI responses
- Loading state management

### 5. Error Handling
- Graceful failure handling
- Meaningful error messages
- Recovery scenarios tested

### 6. Cross-Browser Testing
- Multi-browser configuration
- Responsive design testing
- Consistent behavior validation

## Maintenance Notes

### Adding New Tests
1. Follow existing naming conventions
2. Use helper methods from `test-helpers.ts`
3. Add new helper methods for reusable operations
4. Include both positive and negative test cases

### Debugging Tests
1. Use `--debug` flag for step-by-step debugging
2. Add screenshots at failure points
3. Check browser console for errors
4. Verify network requests in dev tools

### CI/CD Integration
- Tests run automatically on deployment
- Parallel execution for faster feedback
- Results available in HTML report
- Screenshots/videos uploaded on failure

## Environment Requirements

- Node.js 18+
- PNPM package manager
- Playwright browsers installed (`pnpm test:install`)
- Local development server running on port 5173
