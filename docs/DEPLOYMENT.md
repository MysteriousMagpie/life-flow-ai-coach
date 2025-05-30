
# Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel with separate environments.

### Development Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to development environment
vercel --prebuilt
```

### Production Deployment
```bash
# Deploy to production environment
vercel --prod
```

### Environment Configuration

1. **Vercel Dashboard Setup**:
   - Create "Development" and "Production" environments in your Vercel project
   - Set environment variables for each environment:
     - `@openai_api_key` - Your OpenAI API key
     - `@supabase_url` - Your Supabase project URL
     - `@supabase_anon_key` - Your Supabase anonymous key

2. **Environment Variables**:
   - Development: Use development/staging Supabase project
   - Production: Use production Supabase project
   - Separate OpenAI API keys can be used for cost management

3. **API Routes**:
   - The `/api/gpt` endpoint is automatically configured for serverless deployment
   - Health check available at `/health`

### Vercel Configuration

The project includes a `vercel.json` file with:
- Automatic build configuration
- API route handling
- Environment variable mapping
- SPA routing support

### Manual Deployment

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

### Backend (Railway/Heroku)

1. Create a new service on Railway or Heroku
2. Connect your GitHub repository
3. Set the `OPENAI_API_KEY` environment variable
4. Deploy the server using the provided workflows

## Environment Variables

### Required for Development

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous public key | `eyJ...` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
