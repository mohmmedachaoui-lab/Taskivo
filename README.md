# Taskivo — Cyber-Productivity Terminal

> A gamified productivity platform built with a cyberpunk-terminal aesthetic. Complete tasks, earn XP, duel friends, join guilds, and track your productivity with AI-driven insights — all in real-time.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Auth+%7C+Firestore-FFCA28?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## Visual Showcase

<!-- Replace the placeholder below with a GIF or screenshot of your Bento Dashboard -->

![Taskivo Dashboard](placeholder-dashboard.gif)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Animation | Framer Motion |
| Auth | Firebase Authentication (Google) |
| Database | Cloud Firestore (real-time listeners) |
| Hosting | Vercel |

---

## Core Features

- **Real-Time Sync** — All data (tasks, duels, guilds, notifications, feed) streams live via Firestore `onSnapshot` listeners.
- **Bento Grid Dashboard** — A Netflix-inspired, color-coded bento layout with 3D-tilt cards, pulsing stat cards, and particle burst effects.
- **XP Math Engine** — Dynamic XP calculation with win bonuses, penalty deductions, missed task penalties, and configurable duel stakes.
- **AI-Driven Focus Companion** — Context-aware nudge system that generates encouragement, break reminders, focus tips, and milestone celebrations based on your productivity score.
- **Weekly Goal Architect** — Set weekly missions with repeatable tasks, track progress with animated rings, and get suggested tasks from analytics.
- **Social System** — Friend requests, 1v1 XP duels, guilds with leaderboards, and a live activity feed.
- **Achievement System** — 12 unlockable achievements across tasks, streaks, levels, XP, duels, and focus sessions.
- **Terminal Override Easter Egg** — Press `Ctrl+Shift+X` to unlock Dark Mode V2 with a cyber-terminal aesthetic.
- **Cinematic Landing Page** — 9 animated components: particle background, magnetic buttons, tilt cards, scroll reveals, feature showcase, stats marquee, FAQ accordion, and a final CTA.
- **Strict Security Rules** — Firestore rules enforce UID-based data access with composite indexes for efficient queries.

---

## How It Works

### Architecture

```
Client (Next.js)
  │
  ├── Firebase Auth (Google OAuth)
  │
  ├── Firestore (real-time)
  │     ├── users/{uid}          → profile, stats
  │     ├── tasks/{id}           → user tasks
  │     ├── duels/{id}           → 1v1 challenges
  │     ├── guilds/{id}          → team data
  │     ├── weeklyGoals/{id}     → weekly missions
  │     ├── notifications/{id}   → user notifications
  │     └── feed/{id}            → activity feed
  │
  └── Zustand (client state)
        └── Profile + stats synced from Firestore
```

### Data Flow

1. **Authentication** — User signs in via Google. Firebase Auth provides a UID.
2. **Firestore Listeners** — `onSnapshot` hooks subscribe to the user's documents. Data streams in real-time.
3. **XP Engine** — All XP changes go through `calculateWinXP`, `calculatePenaltyXP`, and `calculateDuelStake` with min/max bounds.
4. **Security** — Firestore rules verify `request.auth.uid == resource.data.uid` before any read/write.
5. **Notifications** — Event-driven: duels, friend requests, achievements, and guild activity push notifications to the relevant users.
6. **Analytics** — Productivity Score (0-100) is computed from completion rate, streak, duels, focus hours, and activity. The Focus Companion uses this to generate contextual nudges.

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project with Authentication (Google) and Firestore enabled

### Setup

```bash
# Clone the repository
git clone https://github.com/mohmmedachaoui-lab/Taskivo.git
cd Taskivo

# Install dependencies
npm install

# Create your environment file
cp .env.example .env.local
```

### Configure `.env.local`

Add your Firebase config keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy

```bash
npm run build
```

Or connect the repo to Vercel for automatic deployments.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Auth pages (login, onboarding)
│   ├── (dashboard)/     # Dashboard, tasks, duels, guilds, etc.
│   ├── page.tsx         # Cinematic landing page
│   └── globals.css      # All CSS: glass, neon, bento, animations
├── components/
│   ├── dashboard/       # Bento cards, hero, shelves, goals
│   ├── gamification/    # Level ring, focus timer
│   ├── landing/         # 9 cinematic landing components
│   ├── layout/          # Sidebar, bottom nav
│   ├── social/          # Notifications panel
│   └── ui/              # BentoCard, PulsingStatCard, ParticleBurst, etc.
├── hooks/               # Real-time Firestore hooks, auth, weekly goals
├── lib/
│   ├── firebase.ts      # Lazy Firebase init
│   ├── xp-engine.ts     # XP math engine
│   ├── social.ts        # Social CRUD (friends, duels, guilds)
│   ├── analytics.ts     # Productivity Score + recommendations
│   └── companion.ts     # AI Focus Companion nudge system
├── store/               # Zustand global state
└── types/               # TypeScript interfaces
```

---

## License

This project is licensed under the [MIT License](LICENSE).

Copyright (c) 2026 Mohammed Achaoui
