
# Contributing Guide

## Getting Started

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines below
4. Test your changes thoroughly
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Guidelines

### Code Style
- Use TypeScript strictly - no `any` types
- Follow existing naming conventions
- Keep components small and focused (50 lines or less)
- Use meaningful variable and function names
- Add comments for complex logic

### Component Guidelines
- Create new files for every component or hook
- Use shadcn/ui components when possible
- Implement responsive designs with Tailwind CSS
- Follow React best practices and hooks patterns

### Testing Requirements
- Write unit tests for utility functions
- Add E2E tests for new user flows
- Ensure all tests pass before submitting PR
- Test on different screen sizes

### Commit Messages
Follow conventional commit format:
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests
- `chore:` maintenance tasks

## Pull Request Process

1. **Before Submitting**:
   - Run `npm run lint` and fix any issues
   - Run `npm test` and ensure all tests pass
   - Run `npm run build` to check for build errors
   - Test your changes manually

2. **PR Description**:
   - Clearly describe what your changes do
   - Include screenshots for UI changes
   - Reference any related issues
   - List breaking changes if any

3. **Review Process**:
   - Address reviewer feedback promptly
   - Keep PRs focused and reasonably sized
   - Update documentation if needed

## Architecture Considerations

- Don't over-engineer solutions
- Prefer simple, readable code
- Consider performance implications
- Maintain existing patterns and conventions
- Add comprehensive error handling only when requested

## Getting Help

- Check existing issues and documentation first
- Ask questions in GitHub issues
- Join the Discord community for discussions
- Reference the Lovable documentation for platform-specific help
