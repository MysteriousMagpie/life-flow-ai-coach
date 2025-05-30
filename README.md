
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

## 📚 Documentation

- **[Development Guide](docs/DEVELOPMENT.md)** - Development setup, scripts, and workflow
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Project structure and technology stack
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Testing Guide](docs/TESTING.md)** - Testing setup and best practices
- **[Contributing](docs/CONTRIBUTING.md)** - How to contribute to the project

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
