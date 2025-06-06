
# Architecture Overview

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Express.js, Supabase
- **AI Integration**: OpenAI GPT with function calling
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Testing**: Vitest, Playwright
- **Deployment**: Vercel (frontend), Railway/Heroku (backend)

## Project Structure

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

## Key Architectural Decisions

### State Management
- Uses React Query for server state management
- Local component state for UI interactions
- Supabase for data persistence

### Module System
- `ModuleContainer` preserves state across tab switches
- Each module is a self-contained feature
- Uses CSS visibility for performance

### AI Integration
- OpenAI function calling for structured responses
- Streaming responses with optimistic UI
- Action execution system for AI-driven operations

### Authentication
- Supabase Auth with email/password
- Protected routes with authentication context
- Session management built-in

## Design Patterns

- **Component Composition**: Small, focused components
- **Custom Hooks**: Business logic separation
- **Service Layer**: Abstracted data operations
- **Type Safety**: Strict TypeScript usage
- **Responsive Design**: Mobile-first approach
