# 📄 Docify

<div align="center">

**The modern, AI-powered collaborative document editor and knowledge workspace.**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square&logo=drizzle)](https://orm.drizzle.team/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=flat-square&logo=google)](https://deepmind.google/technologies/gemini/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-1.2-purple?style=flat-square)](https://better-auth.com/)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [Project Structure](#-project-structure) • [Environment Variables](#-environment-variables) • [License](#-license)

</div>

---

## ✨ Overview

**Docify** is an intelligent, high-performance web-based document editing platform designed for speed, clarity, and collaboration. Built on modern web technologies including **Next.js 15 App Router**, **TipTap**, **Google Gemini 2.5 Flash AI**, and **Better-Auth**, Docify combines a distraction-free writing interface with power-tools for teams and solo creators alike.

---

## 🚀 Key Features

### ✍️ Rich Text Editing
- **TipTap Core**: Fast, headless extensible rich-text editing engine.
- **Full Typography Support**: Headings (H1, H2, H3), bold, italic, underline, strikethrough, blockquotes, ordered/unordered lists, code snippets, and hyperlinks.
- **Interactive Tables**: Insert 3x3 tables, add or delete rows and columns on the fly.
- **Live Stats Bar**: Real-time word count, character count, and estimated reading time.
- **Auto-Saving & Optimistic State**: Automatic background debounced saving with visual cloud sync status indicators.

### 🤖 Google Gemini AI Writing Assistant
- **Dedicated Sidebar Assistant**: Clean, non-intrusive 2-column layout with real-time AI generation.
- **Quick Transformations**:
  - ✨ *Improve Writing*
  - 🔍 *Fix Grammar & Spelling*
  - 📝 *Summarize Key Points*
  - ➕ *Make Longer / Expand*
  - ➖ *Make Shorter / Concise*
  - 🎭 *Change Tone* (Professional, Casual, Academic, Creative, Persuasive)
  - 🌐 *Translate* into 8+ languages (Spanish, French, German, Arabic, Japanese, etc.)
  - ✍️ *Continue Writing* & *Custom Prompt Instructions*
- **1-Click Insertion**: Insert AI results below or replace highlighted selection directly in the editor.

### 👥 Real-Time Collaboration & Permissions
- **Granular Access Control**: Share documents with specific teammates as **Editors** (full editing & AI powers) or **Viewers** (read-only mode).
- **Collaborator Management**: Invite by email, adjust permissions in real time, or revoke access.
- **Shared Documents Hub**: Dedicated "Shared with Me" view on the dashboard.

### 📁 Folders, Tags & Starred Documents
- **Color-Coded Folders**: Organize documents into custom colored folders.
- **Custom Tagging**: Apply and filter by `#tags` across your workspace.
- **Starred Documents**: Quick 1-click starring for important notes and high-priority drafts.
- **Instant Full-Text Search**: Real-time client-side search across document titles, stripped HTML body content, tags, and folder names.
- **Flexible Sorting**: Sort by recently updated, oldest, or alphabetical order.

### 📤 Multi-Format Document Export
- **PDF Export**: Browser-native print view with custom print styling (hides navigation, toolbars, and sidebars).
- **Markdown Export (`.md`)**: Full HTML-to-Markdown conversion with ATX headings and structured lists.
- **HTML Export (`.html`)**: Self-contained, responsive standalone HTML file.
- **Plain Text Export (`.txt`)**: Clean formatted text download.

### 💳 Tiered Billing & Pricing (Mock-up Ready)
- 3-tier pricing model (**Free**, **Plus**, and **Pro**).
- Monthly vs Annual billing toggle with 25% discount calculation.
- Interactive simulated checkout modal, usage meters, and billing history invoices.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/) |
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/), [Shadcn UI](https://ui.shadcn.com/) |
| **Editor Engine** | [TipTap](https://tiptap.dev/) |
| **Artificial Intelligence** | [Google Gemini 2.5 Flash](https://ai.google.dev/) via `@google/genai` |
| **Authentication** | [Better-Auth](https://better-auth.com/) (Email/Password, OAuth, Sessions) |
| **Database & ORM** | [Neon PostgreSQL](https://neon.tech/), [Drizzle ORM](https://orm.drizzle.team/) |
| **Markdown Conversion** | [Turndown](https://github.com/mixmark-io/turndown) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |

---

## 📂 Project Structure

```
docify/
├── src/
│   ├── app/                         # Next.js App Router Pages & API Routes
│   │   ├── (auth)/                  # Login & Signup pages
│   │   ├── api/auth/[...all]/       # Better-Auth endpoints
│   │   ├── billing/                 # 3-tier Billing & Pricing page
│   │   ├── documents/               # Dashboard & Document Workspace
│   │   │   ├── [id]/                # Single Document editor view
│   │   │   ├── new/                 # New Document creation route
│   │   │   └── page.tsx             # Documents Dashboard
│   │   ├── profile/                 # User Profile & account settings
│   │   ├── globals.css              # Theme variables, print & table styles
│   │   └── layout.tsx               # Root application layout
│   ├── components/                  # Reusable UI & Feature Components
│   │   ├── ui/                      # Base UI primitives (Button, Card, Dialog, etc.)
│   │   ├── ai-assistant.tsx         # Standalone Gemini AI writing assistant card
│   │   ├── billing-view.tsx         # Interactive 3-tier subscription view
│   │   ├── dashboard-client.tsx     # Dashboard search, folder filter & sorting
│   │   ├── document-card.tsx        # Document grid card with stars & export actions
│   │   ├── document-workspace.tsx   # 2-Column responsive document editing workspace
│   │   ├── editor.tsx               # TipTap rich-text editor with tables & stats
│   │   ├── folder-dialog.tsx        # Create & color-code custom folders dialog
│   │   ├── share-card.tsx           # Document sharing & collaborator roles card
│   │   └── tag-dialog.tsx           # Tag management dialog
│   ├── db/                          # Database configuration
│   │   ├── drizzle.ts               # Neon DB client connection
│   │   └── schema.ts                # Drizzle schema (user, doc, folder, collaborator)
│   ├── lib/                         # Client & Server Utilities
│   │   ├── auth.ts                  # Better-Auth server configuration
│   │   ├── auth-client.ts           # Better-Auth client hooks
│   │   ├── export-utils.ts          # PDF, Markdown, HTML, and TXT exporters
│   │   └── utils.ts                 # Class merger (clsx + tailwind-merge)
│   └── server/                      # Server Actions & Business Logic
│       ├── ai.ts                    # Google Gemini AI generation server action
│       ├── documents.ts             # CRUD, starring, tagging & collaborator actions
│       └── folders.ts               # Folder management server actions
├── drizzle.config.ts                # Drizzle Kit CLI configuration
├── package.json
└── tsconfig.json
```

---

## ⚡ Quick Start

### 1. Prerequisites
- [Bun](https://bun.sh/) (or Node.js 18+ and pnpm/npm)
- A PostgreSQL Database (e.g. [Neon Database](https://neon.tech/))
- A [Google Gemini API Key](https://aistudio.google.com/)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/docify.git
cd docify
```

### 3. Install Dependencies
```bash
bun install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample.neon.tech/docify?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-32-characters"
BETTER_AUTH_URL="http://localhost:3000"

# Google Gemini AI
GEMINI_API_KEY="AIzaSy..."
```

### 5. Push Database Schema
```bash
bun drizzle-kit push
```

### 6. Start Development Server
```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Yes** | Connection string for Neon / PostgreSQL database |
| `BETTER_AUTH_SECRET` | **Yes** | Random 32+ character string for auth token signing |
| `BETTER_AUTH_URL` | **Yes** | Base URL of the app (`http://localhost:3000` in dev) |
| `GEMINI_API_KEY` | **Yes** | API Key from Google AI Studio for Gemini 2.5 Flash |

---

## 📜 Available Scripts

- `bun run dev` - Starts the Next.js development server with hot-reloading.
- `bun run build` - Creates an optimized production build.
- `bun run start` - Runs the compiled Next.js production server.
- `bun run lint` - Runs ESLint checks.
- `bun drizzle-kit push` - Pushes Drizzle schema definitions directly to the database.
- `bun drizzle-kit studio` - Launches local visual Drizzle Studio database manager.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to open a pull request or submit an issue on GitHub.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
