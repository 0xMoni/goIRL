# goIRL

Tech events in India worth showing up to — hackathons, meetups, workshops where you'll learn something *and* meet your people. Even if you come alone.

**Live:** https://goirl-tau.vercel.app

## Features

- 🎯 **Curated events** — Hackathons, meetups, and workshops across India
- 🔐 **Auth & RSVPs** — Supabase authentication with magic links, save events you're attending
- 🗺️ **3D map view** — MapLibre GL with venue markers and city navigation
- ✨ **Smart filtering** — By city, topic, price, vibe tags, and urgency signals
- 📱 **Mobile-first** — Responsive design with dark mode
- 🤖 **Auto-ingestion** — Daily cron job pulls events from MLH, Lu.ma, Devfolio
- 👨‍💼 **Admin moderation** — Review and approve user-submitted events
- 🎨 **Dynamic covers** — Real event images with gradient fallbacks for missing covers
- 📅 **Calendar export** — Add events to Google Calendar (.ics)
- 🔗 **Share** — WhatsApp and Twitter share buttons

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Auth:** Supabase (magic links)
- **Database:** Supabase (PostgreSQL)
- **Maps:** MapLibre GL
- **Deployment:** Vercel
- **Data sources:** MLH, Lu.ma, Devfolio APIs

## Project structure

```
src/
├── app/              # Next.js app router pages
│   ├── dashboard/    # Main event feed
│   ├── events/[id]/  # Event detail page
│   ├── map/          # 3D map view
│   ├── submit/       # User event submission
│   ├── admin/        # Admin moderation panel
│   └── profile/      # User profile & RSVPs
├── components/       # Reusable UI components
├── lib/              # Utils, auth, ranking logic
└── data/             # Event data, topics, city coords
```

## Environment variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ADMIN_EMAILS=your@email.com
```

## Deploy on Vercel

```bash
vercel --prod
```
