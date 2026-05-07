# Auraboard (FlowDesk) - Project Onboarding

You are an AI assistant helping with the **Auraboard (FlowDesk)** project. Please read the following context to understand the current structure, tech stack, features, and status of the project before answering any further questions or writing code.

## 1. Project Overview & Purpose
Auraboard (referred to in the UI as **FlowDesk**) is a minimal, focused productivity dashboard. It helps users manage their daily tasks while providing an AI-generated reflection space to keep them grounded. 

The primary goal is to provide a clean, distraction-free environment where users can authenticate securely, track their task progress, categorize their work, and receive contextual reflections based on their current mood.

## 2. Tech Stack
- **Framework:** Next.js (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database / ORM:** Prisma (PostgreSQL connection configured)
- **Authentication:** NextAuth.js (Google Provider)

## 3. Project Structure
```
auraboard/
├── app/
│   ├── api/
│   │   ├── auth/          # NextAuth routes
│   │   ├── reflection/    # API endpoint generating AI reflections based on mood
│   │   └── tasks/         # CRUD endpoints for tasks (GET, POST, PATCH, DELETE)
│   ├── profile/           # Profile page route
│   ├── layout.tsx         # Global layout
│   ├── page.tsx           # Main Dashboard (FlowDesk) - Auth logic, Task list, Reflection UI
│   └── globals.css        # Global styles and Tailwind imports
├── prisma/
│   └── schema.prisma      # Database schema (User and Task models)
├── .env / .env.local      # Environment variables (Database URLs, NextAuth secrets, Google credentials)
├── package.json           # Dependencies (next, react, prisma, next-auth, tailwindcss)
└── dev.db                 # Local SQLite database (if used locally, though schema specifies postgresql)
```

## 4. Database Schema Overview
The database uses Prisma with the following core models:
- **User:** `id`, `email` (unique), `name`, `createdAt`. Has a one-to-many relationship with `Task`.
- **Task:** `id`, `text`, `completed` (boolean), `category` (optional string), `userId` (relation to User), `createdAt`.

## 5. Key Features & Workflows
1. **Authentication:** 
   - Uses `next-auth` configured with Google login. 
   - Unauthenticated users are shown a minimal sign-in screen on the main page.
2. **Task Management:** 
   - Users can Add, Toggle (complete/incomplete), and Delete tasks.
   - Tasks can be assigned a category (Personal, Work, Health, Study).
   - A visual progress bar updates dynamically based on the percentage of completed tasks.
3. **AI Reflections:**
   - A dedicated UI section displays a "Reflection" paragraph generated from the `/api/reflection` endpoint.
   - Users can refresh the reflection manually. It passes a `mood` parameter (currently hardcoded or managed by state) to the backend.

## 6. How You Can Help
When I ask for a new feature, a bug fix, or a modification:
1. **Follow the App Router Convention:** Ensure any new routes or API endpoints adhere to the Next.js App Router paradigm (`app/api/.../route.ts`).
2. **Maintain Prisma Schema Sync:** If a new feature requires database changes, remember to update `prisma/schema.prisma` and remind me to run `prisma db push` or `prisma migrate`.
3. **Respect the Minimal UI:** Keep Tailwind styling clean, minimal, and aligned with the current "FlowDesk" aesthetic (gray scales, white cards, minimal borders).
4. **TypeScript Safety:** Ensure proper typing for React components, API responses, and database interactions.

Please acknowledge that you have read this onboarding document and are ready to assist with the Auraboard (FlowDesk) project!
