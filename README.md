
# Life Flow - AI-Powered Life Management Platform

[![CI Status](https://github.com/your-username/life-flow/workflows/CI/badge.svg)](https://github.com/your-username/life-flow/actions)
[![Deploy Status](https://github.com/your-username/life-flow/workflows/Deploy/badge.svg)](https://github.com/your-username/life-flow/actions)

Life Flow is an intelligent life management platform that combines AI assistance with comprehensive planning tools for meals, workouts, tasks, and time blocking. Built with React, TypeScript, and Supabase.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)
- OpenAI API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # OpenAI Configuration (for AI features)
   OPENAI_API_KEY=your_openai_api_key
   
   # Server Configuration
   PORT=5000
   ```

4. **Start the development servers**
   ```bash
   # Start the client (port 8080)
   npm run dev
   
   # In a separate terminal, start the server (port 5000)
   npm run server
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080`

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the project for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint for code quality checks |
| `npm test` | Run the test suite with Vitest |
| `npm run test:e2e` | Run end-to-end tests with Playwright |
| `npm run server` | Start the Express backend server |

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Supabase
- **AI Integration**: OpenAI GPT with function calling
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (frontend), Railway/Heroku (backend)

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components (shadcn/ui)
│   ├── Dashboard.tsx   # Main dashboard
│   ├── MealPlanner.tsx # Meal planning interface
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Route components
├── server/             # Express server code
│   ├── gptFunctions.ts # OpenAI function definitions
│   └── gptRouter.ts    # AI request handling
├── services/           # Supabase service wrappers
├── types/              # TypeScript type definitions
└── utils/              # Helper utilities
e2e/                    # End-to-end tests
.github/workflows/      # CI/CD workflows
```

## 🔧 Environment Variables

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

## 🚢 Deployment

### Vercel Deployment

This project is configured for deployment on Vercel with separate environments:

#### Development Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to development environment
vercel --prebuilt
```

#### Production Deployment
```bash
# Deploy to production environment
vercel --prod
```

#### Environment Configuration

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

#### Vercel Configuration

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

## 🧪 Testing

### Unit Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests
```bash
# Install Playwright browsers
npx playwright install

# Run e2e tests
npm run test:e2e

# Run e2e tests with UI
npm run test:e2e -- --ui
```

#### E2E Test Configuration

Set up environment variables for testing:
```bash
# .env.local (for local testing)
TEST_EMAIL=test@example.com
TEST_PASSWORD=testpassword123
VITE_SUPABASE_URL=your_test_supabase_url
VITE_SUPABASE_ANON_KEY=your_test_supabase_key
```

## 📊 Features

- **🤖 AI Assistant**: Natural language interaction with OpenAI GPT
- **🍽️ Meal Planning**: Create and schedule meals with nutritional tracking
- **💪 Workout Planning**: Schedule and track fitness activities
- **📝 Task Management**: Organize and prioritize daily tasks
- **⏰ Time Blocking**: Visual calendar for time management
- **🔔 Reminders**: Smart notification system
- **📈 Analytics**: Progress tracking and insights
- **📅 Calendar Export**: Export schedules to .ics format
- **🔐 Authentication**: Secure user authentication via Supabase
- **💬 Real-time Chat**: Streaming AI responses with optimistic UI

## 🗺️ Roadmap

### Current Release (v1.0)
- [x] Core dashboard and navigation
- [x] Basic CRUD for meals, workouts, tasks
- [x] OpenAI function calling integration
- [x] Calendar export functionality
- [x] CI/CD pipeline
- [x] E2E testing with Playwright
- [x] Vercel deployment configuration

### Next Release (v1.1)
- [ ] Mobile responsive design improvements
- [ ] Push notifications
- [ ] Advanced analytics and reporting
- [ ] Social features and sharing
- [ ] Integrations (Google Calendar, Fitbit, etc.)

### Future Releases
- [ ] Mobile app (React Native)
- [ ] Offline support
- [ ] Team collaboration features
- [ ] Advanced AI planning algorithms
- [ ] Habit tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Lovable Docs](https://docs.lovable.dev/)
- **Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Issues**: [GitHub Issues](https://github.com/your-username/life-flow/issues)

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components by [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Backend by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

