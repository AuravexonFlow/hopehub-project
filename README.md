# Hope HUb

> Next-generation workspace platform powered by **VORTEX Framework** & **Supabase**

## ◆ Overview

Hope HUb is a production-ready project management application featuring:

- **VORTEX Framework** — Custom signal-based reactive UI framework
- **Supabase Backend** — Auth, database, realtime, and storage
- **Futuristic UI** — Cyberpunk-inspired design with glassmorphism and neon accents
- **Full CRUD** — Projects, tasks, analytics, and team management
- **Real-Time** — Live data subscriptions and presence tracking
- **Kanban Board** — Drag-and-drop task management

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

Run the SQL migration in your Supabase dashboard:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Hope HUb/
├── src/
│   ├── vortex/              # VORTEX Framework (custom)
│   │   ├── signals.ts       # Reactive signals
│   │   ├── component.ts     # Component system
│   │   ├── router.ts        # SPA router
│   │   ├── store.ts         # State management
│   │   ├── render.ts        # DOM renderer
│   │   └── index.ts         # Public API
│   ├── lib/
│   │   └── supabase.ts      # Supabase client
│   ├── services/
│   │   ├── auth.ts          # Authentication
│   │   ├── database.ts      # CRUD operations
│   │   ├── realtime.ts      # Live subscriptions
│   │   └── toast.ts         # Notifications
│   ├── stores/
│   │   ├── app-store.ts     # App state
│   │   └── data-store.ts    # Data state
│   ├── components/
│   │   ├── sidebar.ts       # Navigation
│   │   ├── navbar.ts        # Header
│   │   ├── modal.ts         # Dialogs
│   │   ├── loading.ts       # Loaders
│   │   └── stat-card.ts     # Metrics
│   ├── pages/
│   │   ├── home.ts          # Landing page
│   │   ├── auth.ts          # Login/Register
│   │   ├── dashboard.ts     # Overview
│   │   ├── projects.ts      # Project management
│   │   ├── tasks.ts         # Task management
│   │   ├── analytics.ts     # Metrics & charts
│   │   └── settings.ts      # User settings
│   ├── styles/
│   │   └── main.css         # Full design system
│   └── main.ts              # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 🏗️ VORTEX Framework

VORTEX is a custom-built reactive UI framework featuring:

| Feature | Description |
|---------|-------------|
| **Signals** | Fine-grained reactivity with automatic dependency tracking |
| **Components** | Declarative component system with lifecycle hooks |
| **Router** | History-based SPA routing with guards and lazy loading |
| **Store** | Global state management with persistence |
| **Renderer** | Efficient DOM rendering with event delegation |

### Example

```typescript
import { createSignal, createEffect, h, render } from './vortex';

const count = createSignal(0);

const Counter = () => h('div', null,
  h('h1', null, `Count: ${count()}`),
  h('button', { onClick: () => count.set(count.peek() + 1) }, '+1'),
);

render(h(Counter, {}), '#app');
```

## 🔐 Authentication

Supported providers:
- Email / Password
- Google OAuth
- GitHub OAuth
- Discord OAuth
- Password Reset

## 📊 Features

- **Dashboard** — Real-time stats and activity feed
- **Projects** — Create, manage, and track project progress
- **Tasks** — Kanban board with priority levels and status tracking
- **Analytics** — Charts, completion rates, and distribution metrics
- **Settings** — Profile, theme, and security configuration
- **Real-Time** — Live updates via Supabase subscriptions

## 🛠️ Build

```bash
npm run build
```

Output: `dist/` — optimized for production with code splitting.

## 📄 License

MIT © AURAVEXON
