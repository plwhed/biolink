<div align="center">

# egirls.lol

[Discord Server](https://discord.gg/kmvA4BqNJm)

**A link-in-bio platform**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green)](#)

</div>

---

## Overview

egirls.lol is a customizable link-in-bio platform where users create a public profile page at `/username` with avatar, social links, custom buttons, and badge display. Features a full dashboard with appearance customization, analytics, and a glassy animated UI.

## Features

- **Landing page** with animated noise-gradient background and mouse-tracking parallax
- **Auth system** — register/login with JWT sessions (7-day httpOnly cookies)
- **Public profiles** — `/username` with avatar, social icons, custom links, and badges
- **Dashboard** — overview stats (views, clicks, link count) with 14-day bar chart
- **Appearance editor** with 3 tabs:
  - **Media** — upload avatar, background, and cursor images with delete support
  - **Links** — add/edit/remove social links (Instagram, YouTube, TikTok, Discord, Twitter, GitHub) with drag-to-reorder
  - **Layout** — centered vs left-aligned layout, background blur slider (0–20px), click-to-show overlay with custom text
- **Badges** — Font Awesome icons stored in DB, shown as small pills on profiles with hover tooltips
- **Click tracking** — redirect endpoint tracks link clicks
- **Custom 404** page

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Database | [Neon Postgres](https://neon.tech) (serverless) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [jose](https://github.com/panva/jose) (JWT) |
| Passwords | [bcryptjs](https://github.com/nicolo-ribaudo/bcryptjs) |
| Icons | [Font Awesome](https://fontawesome.com) (React) |
| Effects | [noise-gradient-bg](https://www.npmjs.com/package/noise-gradient-bg) |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database (or any PostgreSQL)

### 1. Clone & install

```bash
git clone https://github.com/yourname/egirls.lol.git
cd egirls.lol
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="a-random-64-char-hex-string"
```

### 3. Push database schema

```bash
npx drizzle-kit push
```

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
├── page.tsx                     # Landing page
├── layout.tsx                   # Root layout (Geist fonts)
├── not-found.tsx                # Custom 404
├── register/page.tsx            # Login/register
├── dashboard/
│   ├── page.tsx                 # Overview (stats + chart)
│   └── appearance/              # Media, links, layout tabs
├── [username]/page.tsx          # Public profile page
└── api/
    ├── register/route.ts        # POST - Create account
    ├── login/route.ts           # POST - Authenticate
    ├── logout/route.ts          # POST - End session
    ├── profile/route.ts         # GET/PUT - Profile CRUD
    ├── upload/route.ts          # POST/DELETE - File uploads
    └── click/route.ts           # GET - Link redirect + tracking

components/
├── navbar.tsx                   # Top navigation
├── auth-card.tsx                # Login/register form
├── landing-background.tsx       # Animated noise background
├── profile-overlay.tsx          # Click-to-show overlay
├── badge-icon.tsx               # Font Awesome badge renderer
└── dashboard/
    ├── sidebar.tsx              # Dashboard navigation
    ├── stat-card.tsx            # Metric display
    ├── views-chart.tsx          # 14-day bar chart
    └── appearance/              # Media, links, layout editors

lib/
├── schema.ts                    # Drizzle table definitions
├── db.ts                        # Neon + Drizzle connection
└── auth.ts                      # JWT session helper

middleware.ts                     # Auth guard for /dashboard/*
```

## Database Schema

| Table | Purpose |
|---|---|
| `users` | User accounts (id, username, email, password_hash, created_at) |
| `profiles` | Profile settings (avatar, background, cursor, layout, blur, overlay) |
| `social_links` | Platform social links (Instagram, Discord, etc.) with order |
| `links` | Custom link buttons with click tracking |
| `badges` | Badge definitions (name, Font Awesome icon, color) |
| `user_badges` | Badge assignments (user ↔ badge) |
| `page_views` | Profile view analytics |

## API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | No | Create account |
| `POST` | `/api/login` | No | Authenticate, set session |
| `POST` | `/api/logout` | Yes | Clear session |
| `GET` | `/api/profile` | Yes | Get profile + social links |
| `PUT` | `/api/profile` | Yes | Update profile + social links |
| `POST` | `/api/upload` | Yes | Upload image file |
| `DELETE` | `/api/upload` | Yes | Delete uploaded file |
| `GET` | `/api/click?id=` | No | Track click + redirect |

## Managing Badges

Badges are stored in the database. Insert via SQL:

```sql
-- Create a badge
INSERT INTO badges (id, name, icon_prefix, icon_name, color)
VALUES (gen_random_uuid(), 'Creator', 'solid', 'fa-crown', 'emerald');

-- Assign to a user
INSERT INTO user_badges (id, user_id, badge_id)
VALUES (gen_random_uuid(), 'user-uuid-here', 'badge-uuid-here');
```

**Supported icons:** `fa-star`, `fa-crown`, `fa-gem`, `fa-shield`, `fa-heart`, `fa-fire`, `fa-bolt`, `fa-rocket`, `fa-globe`, `fa-code`, `fa-music`, `fa-paint-brush`, `fa-camera`, `fa-gamepad`, `fa-headphones`, `fa-microphone`, `fa-pen`, `fa-trophy`, `fa-award`, `fa-medal`, `fa-check`, `fa-circle-check`, `fa-certificate`, `fa-diamond`, `fa-wand-magic-sparkles`

**Brand icons:** `fa-discord`, `fa-github`, `fa-twitter`, `fa-youtube`, `fa-twitch`, `fa-tiktok`, `fa-instagram`, `fa-reddit`

## Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## License

MIT
