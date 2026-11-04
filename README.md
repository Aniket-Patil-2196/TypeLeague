# TYPELEAGUE

> **Type. Compete. Climb.**

A community-driven competitive typing platform. Users practise typing, compete in global and group-based daily challenges, create public or private communities, upload custom typing content, earn XP, and climb verified leaderboards.

---

## 1. Non-Negotiable Design Identity

The TypeLeague interface follows a **technical blueprint grid**:
- **Canvas:** Light warm-grey canvas (`#E4E4E4`), visible 1px grid lines (`#B3B3B3`), raised surface cells (`#F6F6F6`), primary ink (`#1B1B1B`).
- **Signal Color:** One orange accent (`#FF6D1F`), used strictly as a fill with dark ink text.
- **Dark Tiles:** Media and arena tiles use high-contrast `--panel` (`#0E0E0E`).
- **Zero Rounded Corners:** `border-radius: 0px` globally on all buttons, cards, modals, dropdowns, avatars, toggles, badges, and inputs.
- **Chamfered Cuts:** Top-left and bottom-right 45-degree diagonal cuts (`clip-path`) on primary buttons and headers.
- **Zero Emoji:** Strictly no unicode emoji or pictographs across UI, toasts, errors, or seed data.
- **Zero Gradients & Shadows:** Flat fills only, `box-shadow: none` everywhere. Depth comes from 1px line grids and layout.
- **Typography:** Display face **Tektur** for headlines, **JetBrains Mono** for UI and body. Tabular numerals on all numbers.
- **Crop-Mark Viewfinder Brackets:** 4 L-shaped corner brackets inset 8px on media tiles and empty states.
- **Design System Style Guide:** Available at `/dev/ui` in development mode.

---

## 2. Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS (custom tokens, zero radius, no shadows)
- React Router DOM v7
- Zustand (lightweight client state)
- TanStack Query v5 (server cache & query state)
- Lucide React (configured with square strokeLinecap and miter strokeLinejoin)
- Axios with automated JWT access-token refresh interceptor
- Fonts via `@fontsource/jetbrains-mono` and `@fontsource/tektur`

### Backend
- Node.js & Express.js (REST API under `/api/v1`)
- MongoDB with Mongoose (with automated development fallback to MongoMemoryServer)
- JWT access tokens + rotating refresh tokens stored in HTTP-only cookies with reuse detection
- bcryptjs for password hashing
- Zod for request body validation
- Helmet, CORS, and Express Rate Limit
- Socket.IO for real-time events
- node-cron for scheduled jobs

---

## 3. Project Structure

```
typeleague/
├── client/
│   ├── src/
│   │   ├── app/                # App root and route registration
│   │   ├── assets/             # Logos and visual assets
│   │   ├── components/
│   │   │   ├── common/         # ProtectedRoute and shared guards
│   │   │   ├── layout/         # AppShell, TopBar, Sidebar, RightRail, StatusStrip
│   │   │   ├── leaderboard/    # Podium and table components
│   │   │   ├── typing/         # Interactive typing arena preview
│   │   │   └── ui/             # Core blueprint primitives (Button, Input, Modal, etc.)
│   │   ├── constants/          # Design tokens and constants
│   │   ├── features/
│   │   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── dashboard/      # Contender overview and statistics
│   │   │   ├── dev/            # /dev/ui design verification kit
│   │   │   ├── landing/        # Technical poster public landing page
│   │   │   ├── leaderboard/    # Leaderboard pages
│   │   │   └── profile/        # User profile and velocity records
│   │   ├── services/           # Axios instance with interceptors
│   │   ├── store/              # Zustand authentication store
│   │   └── styles/             # Chamfer clip-paths and token variables
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   ├── config/             # DB connection and env loader
│   │   ├── controllers/        # Express route handlers
│   │   ├── middleware/         # Auth guard, error handler, rate limiters
│   │   ├── models/             # Mongoose schemas (User, etc.)
│   │   ├── routes/             # API v1 routes (/api/v1/auth, etc.)
│   │   ├── services/           # Business logic (auth, scoring engine)
│   │   ├── utils/              # JWT hashing and token generation
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js
│   │   └── server.js
│   └── tests/                  # Scoring engine unit tests
├── scripts/
│   └── qa-design.js            # Automated Design QA Gate validation script
├── package.json
└── README.md
```

---

## 4. Environment Variables

### Server (`server/.env`)
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/typeleague
JWT_ACCESS_SECRET=your_secure_access_secret_min_32_characters
JWT_REFRESH_SECRET=your_secure_refresh_secret_min_32_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```ini
VITE_API_URL=/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

> **Note on MongoDB Replica Set:**
> MongoDB transactions require a replica set. In production and staging, use MongoDB Atlas (which provides replica sets out of the box). For local development, if a local MongoDB daemon is not detected, the server automatically starts an in-memory replica-ready `MongoMemoryServer` instance for friction-free local execution and testing.

---

## 5. Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Design QA Gate
Validates compliance with design system rules (zero emoji, zero rounded corners, zero gradients, zero shadows, zero blur, token color enforcement):
```bash
npm run qa:design
```

### 3. Run Unit Tests
Executes unit tests covering scoring formulas, tie-breakers, attempt validity, and timezone date keys:
```bash
npm run test
```

### 4. Start Development Servers
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Server runs at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/v1/health`
- Design System Kit: `http://localhost:5173/dev/ui`
