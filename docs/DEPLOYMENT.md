
# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with pnpm package management.

### Development Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# From /client directory
# Deploy to development environment
vercel --prebuilt
```

### Production Deployment
```bash
# From /client directory
# Deploy to production environment
vercel --prod
```

### Environment Configuration

1. **Vercel Dashboard Setup**:
   - Create "Development" and "Production" environments in your Vercel project
   - Set environment variables for each environment:
     - `VITE_SUPABASE_URL` - Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
    - `VITE_API_BASE_URL` - Your backend API URL
    - `API_BASE_URL` - Your backend API URL

2. **Package Manager Configuration**:
   - Vercel automatically detects pnpm via the `.npmrc` file in `/client`
   - Uses pnpm@8.15.0 for faster builds
   - No additional configuration needed

3. **Environment Variables**:
   - Development: Use development/staging Supabase project
   - Production: Use production Supabase project
   - Separate API endpoints for each environment

### Vercel Configuration

The project includes a `vercel.json` file with:
- Automatic build configuration using pnpm
- SPA routing support
- Environment variable mapping

### Manual Deployment

```bash
# From /client directory

# Build the project with pnpm
pnpm run build

# Preview the build
pnpm run preview
```

### Backend (Railway/Heroku)

1. Create a new service on Railway or Heroku
2. Connect your GitHub repository
3. Set the root directory to `server`
4. Set the `OPENAI_API_KEY` environment variable
5. Deploy the server using the provided workflows

## Environment Variables

### Required for Development

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | `eyJ...` |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `API_BASE_URL` | Backend API URL | `http://localhost:5000` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |

## Build Performance

Using pnpm provides several deployment benefits:
- Faster dependency installation
- Reduced build times on Vercel
- Better caching of dependencies
- Smaller node_modules footprint

## CI/CD Pipeline

The GitHub Actions workflow uses pnpm for:
- Installing dependencies with `--frozen-lockfile`
- Building the application
- Running E2E tests
- Caching pnpm store for faster subsequent builds

## Package Manager Migration

If you need to switch back to npm:
1. Remove `packageManager` field from `client/package.json`
2. Delete `client/.npmrc`
3. Update CI workflow to use npm commands
4. Generate `package-lock.json` with `npm install`
