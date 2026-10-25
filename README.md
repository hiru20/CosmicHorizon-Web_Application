# CosmicHorizon – Interactive Space Exploration & Satellite Tracking


CosmicHorizon is a full-stack, real-time web application engineered to track space objects, orbital missions, and astronomical phenomena. It features live International Space Station (ISS) telemetry with interactive Leaflet mapping, upcoming global rocket launch manifests with countdown clocks, NASA deep-space imagery and asteroid tracking, and user persistence for favorites and watchlists.

---

## 🚀 Key Features

* **Real-Time ISS & Satellite Tracker**:
  * Live geographic coordinates (Latitude / Longitude / WGS84).
  * Real-time orbital speed (~27,600 km/h) and altitude (~420 km LEO).
  * Auto-refreshing poll mechanism (every 3.5 seconds) with manual pause/resume.
  * Interactive dark-mode map powered by **Leaflet** with custom pulsing SVG spacecraft markers and historical trajectory trails.
* **Global Rocket Launch Manifest**:
  * Real-time launch schedules via Launch Library 2 (The Space Devs).
  * Countdown timer down to the second (T-minus).
  * Search and multi-criteria filters by launch provider (SpaceX, NASA, Rocket Lab, ULA, ISRO, Arianespace) and flight readiness status (Go, TBD, Hold).
  * Comprehensive modal telemetry with mission overviews, target orbits, and pad locations.
* **NASA Deep Space Observatory**:
  * **Astronomy Picture of the Day (APOD)**: High-resolution daily space photograph/video with calendar date archive and full HD viewer modal.
  * **Mars Surface Rovers**: Photo gallery from Perseverance and Curiosity, filtered by Martian Sol and camera type (FHAZ, RHAZ, MAST, NAVCAM).
  * **Near-Earth Asteroid Radar (NEO)**: Close-approach asteroid tracking with relative velocities, estimated diameters, miss distances, and hazardous alert badges.
* **User Authentication & Mission Persistence**:
  * Secure registration and login using encrypted passwords (`bcryptjs`).
  * Stateless token authorization (`jsonwebtoken` / JWT).
  * Personal **Mission Watchlist** for upcoming rocket launches.
  * Celestial **Bookmarks & Favorites** for APOD and Martian imagery.
  * Dedicated **Astronaut Dashboard** with metrics overview, next countdown widget, and editable user profile.

---

## 🛠️ Architecture & Technology Stack

```
                          ┌─────────────────────────┐
                          │   React 19 + Vite UI    │
                          │   Tailwind CSS + Lucide │
                          │     Leaflet Dark Map    │
                          └────────────┬────────────┘
                                       │ REST / JWT
                                       ▼
                          ┌─────────────────────────┐
                          │    Express.js Server    │
                          │   MVC + Service Layer   │
                          │   In-Memory API Cache   │
                          └──────┬────────────┬─────┘
                                 │            │
            ┌────────────────────┘            └────────────────────┐
            ▼                                                      ▼
 ┌──────────────────────┐                               ┌──────────────────────┐
 │   MongoDB Database   │                               │    External APIs     │
 │  - Users             │                               │  - WhereTheISS.at    │
 │  - Favorites         │                               │  - Launch Library 2  │
 │  - Watchlists        │                               │  - NASA Open APIs    │
 └──────────────────────┘                               └──────────────────────┘
```

* **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Leaflet, Axios, React Router 7.
* **Backend**: Node.js, Express.js, Mongoose ODM, JWT, BcryptJS.
* **Database**: MongoDB (Local or Atlas).
* **Architecture Pattern**: MVC with a dedicated Service Proxy Layer to safeguard third-party API keys and cache external requests against rate limiting (HTTP 429).

---

## 📂 Project Directory Structure

```
CosmicHorizon Project/
├── client/                               # React Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                   # Reusable UI (Modal, Loader, Badge, ProtectedRoute)
│   │   │   ├── layout/                   # Navbar, Footer
│   │   │   ├── tracker/                  # ISSMap, CoordinatesDisplay
│   │   │   ├── launches/                 # LaunchCard, LaunchFilter, CountdownTimer
│   │   │   └── nasa/                     # ApodViewer, MarsGallery, NeoRadar
│   │   ├── context/                      # AuthContext, NotificationContext
│   │   ├── pages/                        # Home, Tracker, Launches, NASA, Dashboard, Login, Register, 404
│   │   ├── services/                     # Axios API clients (auth, space, user)
│   │   ├── App.jsx                       # Master Routing and Context tree
│   │   └── main.jsx                      # Vite entry point
│   ├── .env.example                      # Client environment configuration
│   └── tailwind.config.js                # Custom space-themed color scheme & glow utilities
│
├── server/                               # Node.js + Express REST API
│   ├── src/
│   │   ├── config/db.js                  # MongoDB Mongoose connection
│   │   ├── controllers/                  # Auth, Tracker, Launch, NASA, and User controllers
│   │   ├── middleware/                   # JWT auth guard, Global error handling, 404
│   │   ├── models/                       # User, Favorite, Watchlist Mongoose schemas
│   │   ├── routes/                       # Auth, Space, User REST routes
│   │   ├── services/                     # ISS, Launch, and NASA fetchers with resilient caching
│   │   └── utils/                        # Response formatters, Token generator, Mock fallbacks
│   ├── testAuth.js                       # Automated Auth integration test suite
│   ├── testSpace.js                      # Automated Space API test suite
│   ├── testUser.js                       # Automated Persistence & Dashboard test suite
│   ├── seedDemo.js                       # Viva presentation database seeder
│   └── server.js                         # Application entry listening on port 5000
│
└── README.md                             # Academic and technical documentation
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
* **Node.js** (v18.x or newer)
* **MongoDB** (running locally on port `27017` or a MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd server
npm install

# Start development server
npm run dev
# OR start standard server
npm start
```
The server will run at: `http://localhost:5000`  
Health check endpoint: `http://localhost:5000/api/health`

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite development server
npm run dev
```
The client will open at: `http://localhost:5173`

---

## 🧪 Automated Testing & Seeding (For Viva Defense)

The backend includes automated integration test suites that can be executed directly in the terminal to demonstrate functionality to evaluators:

```bash
cd server

# 1. Run all test suites (Auth, Space APIs, and User Persistence):
npm test

# 2. Or run individual test suites:
npm run test:auth      # Tests registration, password hashing, duplicate check, JWT, and profiles
npm run test:space     # Tests ISS live telemetry, Launch Library, NASA APOD, Mars, and NEO
npm run test:user      # Tests favorites CRUD, watchlist management, and dashboard metrics

# 3. Seed demo data for live demonstration:
npm run seed
```

### 🔑 Demo Credentials for Viva Evaluation
* **Email**: `astronaut@cosmichorizon.space`
* **Password**: `MissionControl2026!`
*(Note: A one-click "Fill Demo Credentials" button is also present on the Login page!)*

---

## 🎓 University Viva Defense Guide & FAQs

### Q1: Why use a Backend Proxy Service instead of calling NASA/Space APIs directly from React?
* **Security**: Direct calls from the browser expose secret API keys in the Network Tab.
* **Rate-Limit Resilience (HTTP 429)**: Free third-party APIs have strict limits (e.g., Launch Library allows 15 req/hr; NASA DEMO_KEY allows 30 req/hr). The Express service layer implements lightweight in-memory caching (10 min TTL for launches, 2 hrs for APOD) and graceful fallback datasets so the live demo never fails.
* **Data Normalization**: Translates raw vendor-specific responses into uniform, clean JSON objects for the frontend.

### Q2: How does authentication work?
* Registration encrypts plain-text passwords using `bcryptjs` with salt hashing before database persistence.
* Login verifies credentials against the hashed password and issues a signed JSON Web Token (JWT).
* Subsequent private requests send the token via HTTP `Authorization: Bearer <token>`. An Express middleware decodes the token and attaches `req.user`.

### Q3: How is data persistence structured in MongoDB?
* **Favorites**: Stores bookmarks (`apod` and `mars`) linked to `user` via ObjectId. Enforces a compound unique index on `{ user, itemType, itemId }` to eliminate duplicate bookmarks.
* **Watchlist**: Stores upcoming tracked launches per user with a unique index on `{ user, launchId }`.
* **Dashboard API**: Uses parallel aggregation (`Promise.all`) across collections to compute total bookmarks, active watchlists, and the next nearest launch countdown.
