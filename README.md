# Taskivo 🚀
**The Cyber-Productivity Ecosystem.**

Taskivo is a high-performance, gamified productivity platform built to transform mundane tasks into an immersive RPG-like experience. Designed for power users who demand speed, offline resilience, and a premium "Cyber-Terminal" aesthetic.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Auth+%7C+Firestore-FFCA28?style=flat-square&logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## 🛠 Tech Stack
*   **Framework:** Next.js 16 (App Router)
*   **Database/Auth:** Firebase (Firestore, Auth, Cloud Functions)
*   **Styling:** Tailwind CSS + Framer Motion
*   **State Management:** Zustand
*   **Deployment:** Vercel (Edge-ready)
*   **PWA:** Service Workers + IndexedDB for offline sync

---

## ✨ Key Features
*   **Mission Control:** A high-density Bento-Grid dashboard merging Missions, Focus Timer, and Alarms into a tab-based, state-persistent interface.
*   **Streak Engine:** A robust streak calculator integrated within Firestore atomic transactions (automatic freeze management).
*   **Offline Resilience:** Full IndexedDB sync queue for task execution during connectivity drops.
*   **Focus Mode:** Visibility-aware focus timer that persists across browser tabs using deadline-based logic.
*   **Cyber-Terminal Aesthetic:** Glassmorphic cards, neon accent glow, and custom micro-interactions.
*   **XP Math Engine:** Dynamic XP calculation with win bonuses, penalty deductions, missed task penalties, and configurable duel stakes.
*   **Social System:** Friend requests, 1v1 XP duels, guilds with leaderboards, and a live activity feed.
*   **Achievement System:** 19 unlockable achievements across missions, streaks, progression, duels, focus, and special milestones.
*   **Terminal Override Easter Egg:** Press `Ctrl+Shift+X` to unlock Dark Mode V2 with a cyber-terminal aesthetic.
*   **Cinematic Landing Page:** 9 animated components: particle background, magnetic buttons, tilt cards, scroll reveals, feature showcase, stats marquee, FAQ accordion, and a final CTA.

---

## 📊 Performance & QA
*   **Bundle Size:** Optimized via `standalone` output and package-level code splitting.
*   **Linting:** 0 Errors / 0 Warnings.
*   **Accessibility:** Full ARIA compliance (dialogs, toasts, and focus management).
*   **SEO:** Dynamic OpenGraph/Twitter meta tags with `metadataBase` implementation.

---

## 📸 Preview
<!-- Replace with screenshots -->

*Mission Control & Dashboard Bento Grid — Merging Tasks, Focus Timer, and Alarms into a single high-density slot.*

*Profile & Achievement System — 19 badges with progress tracking across 6 categories.*

---

## 🏗 Architecture

```
src/
├── app/
│   ├── (auth)/              # Auth pages (login, onboarding)
│   ├── (dashboard)/         # Dashboard, tasks, duels, guilds, focus, alarm, profile
│   │   ├── dashboard/       # Bento grid dashboard with MissionControl
│   │   ├── tasks/           # Mission CRUD with XP rewards
│   │   ├── focus/           # Full focus timer (Pomodoro)
│   │   ├── alarm/           # Smart alarms with math challenges
│   │   ├── duels/           # 1v1 XP duels
│   │   ├── guilds/          # Team leaderboards
│   │   ├── friends/         # Social system
│   │   ├── achievements/    # Badge gallery
│   │   ├── profile/         # Agent profile + full achievements grid
│   │   ├── stats/           # Analytics dashboard
│   │   └── settings/        # System preferences
│   ├── page.tsx             # Cinematic landing page
│   └── globals.css          # Glass, neon, bento, animations
├── components/
│   ├── dashboard/           # MissionControl, HeroSection, BentoCards
│   ├── gamification/        # FocusTimer, LevelRing
│   ├── landing/             # 9 cinematic landing components
│   ├── layout/              # Sidebar, BottomNav
│   ├── social/              # Notifications panel
│   └── ui/                  # BentoCard, ConfirmDialog, Toast, etc.
├── hooks/                   # Firestore listeners, auth, weekly goals
├── lib/
│   ├── firebase.ts          # Lazy Firebase init
│   ├── xp-engine.ts         # XP math engine + achievements
│   ├── social.ts            # Friends, duels, guilds CRUD
│   ├── analytics.ts         # Productivity Score + recommendations
│   ├── streak-engine.ts     # Streak calculator with freeze logic
│   ├── offlineSync.ts       # IndexedDB sync queue
│   └── profiles.ts          # Public profiles + status
├── store/                   # Zustand global state
└── types/                   # TypeScript interfaces
```

---

## 🚀 Setup

```bash
git clone https://github.com/mohmmedachaoui-lab/Taskivo.git
cd Taskivo
npm install
# Setup .env.local with Firebase config
cp .env.example .env.local
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## License

MIT — Copyright (c) 2026 Mohammed Achaoui
