
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
| `npm run server` | Start the Express backend server |

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Supabase
- **AI Integration**: OpenAI GPT with function calling
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Testing**: Vitest
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

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)

1. Create a new service on Railway or Heroku
2. Connect your GitHub repository
3. Set the `OPENAI_API_KEY` environment variable
4. Deploy the server using the provided workflows

### Manual Deployment

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
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

## 🗺️ Roadmap

### Current Release (v1.0)
- [x] Core dashboard and navigation
- [x] Basic CRUD for meals, workouts, tasks
- [x] OpenAI function calling integration
- [x] Calendar export functionality
- [x] CI/CD pipeline

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
