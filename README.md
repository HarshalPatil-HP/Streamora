<div align="center">

# 🎬 Streamora

**A full-stack video streaming platform with a creator community feed**

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v5-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)](LICENSE)

[Live Demo](https://streamora-murex.vercel.app) · [Report Bug](https://github.com/HarshalPatil-HP/VideoTube/issues) · [Request Feature](https://github.com/HarshalPatil-HP/VideoTube/issues)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Reference](#-api-reference)
- [Frontend Routes](#-frontend-routes)
- [Data Models](#-data-models)
- [Security](#-security)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 About the Project

**Streamora** is a production-ready, full-stack video streaming web application inspired by YouTube. It allows users to upload, watch, like, comment on, and share videos. Creators get a dedicated dashboard with analytics. The platform also features a **Twitter-like community tweet feed**, playlists, channel subscriptions, and watch history — all behind a secure JWT-based authentication system.

The backend is a RESTful API built with **Express.js** and **MongoDB (Atlas)**, while the frontend is a **vanilla JS SPA** bundled with **Vite** and styled with **TailwindCSS** — with a custom hash-based client-side router (no framework dependency).

---

## ✨ Features

### 👤 Authentication & Users

- Secure **registration** with avatar and optional cover image upload
- **Login / Logout** with HTTP-only cookie-based JWT (access + refresh token pair)
- **Refresh token rotation** — silent re-authentication without re-login
- **Update profile** — fullname, avatar, cover photo, password
- **Watch history** tracking per user

### 🎬 Videos

- Upload videos with thumbnail to **Cloudinary**
- **Paginated video feed** with search and filtering
- **Watch page** with view tracking, likes, and comments
- Toggle **publish / unpublish** status
- Delete videos (with automatic Cloudinary asset cleanup)

### 💬 Comments

- Add, edit, and delete comments on videos
- Comments are tied to authenticated users

### 👍 Likes

- Like / unlike **videos**, **comments**, and **tweets**
- Fetch all liked videos for the authenticated user

### 📋 Playlists

- Create, update, and delete personal playlists
- Add / remove individual videos from a playlist
- Public playlist view page

### 🔔 Subscriptions

- Subscribe / unsubscribe to channels
- View subscriber count and subscribed channels list

### 🐦 Tweet Feed

- Post short **community tweets** (Twitter-like)
- Edit and delete your tweets
- Like / unlike tweets

### 📊 Creator Dashboard

- View total **videos, views, subscribers, and likes**
- Manage uploaded videos (toggle publish, delete)

### 🔒 Security

- **Rate limiting** on all API routes, with stricter limits on auth endpoints
- **CORS** with environment-aware origin allowlist
- Passwords hashed with **bcrypt** (10 rounds)
- Multer file-type validation and size limits
- Centralized error handling middleware

---

## 🛠 Tech Stack

### Backend

| Technology                         | Purpose                          |
| ---------------------------------- | -------------------------------- |
| **Node.js** (v18+)                 | Runtime environment              |
| **Express.js** (v5)                | Web framework                    |
| **MongoDB Atlas**                  | Cloud NoSQL database             |
| **Mongoose** (v9)                  | ODM / schema modeling            |
| **mongoose-aggregate-paginate-v2** | Cursor-based pagination          |
| **Cloudinary** (v2)                | Video & image media storage      |
| **Multer** (v2)                    | Multipart/form-data file uploads |
| **JSON Web Token (JWT)**           | Stateless authentication         |
| **bcrypt**                         | Password hashing                 |
| **express-rate-limit**             | API rate limiting                |
| **cookie-parser**                  | HTTP cookie parsing              |
| **cors**                           | Cross-origin request handling    |
| **dotenv**                         | Environment variable management  |

### Frontend

| Technology                  | Purpose                 |
| --------------------------- | ----------------------- |
| **Vanilla JS** (ES Modules) | Application logic       |
| **Vite** (v6)               | Build tool & dev server |
| **TailwindCSS** (v3)        | Utility-first styling   |
| **Axios**                   | HTTP client             |
| **Custom Hash Router**      | Client-side SPA routing |

### Dev Tooling

| Tool                    | Purpose                         |
| ----------------------- | ------------------------------- |
| **Nodemon**             | Auto-restart on backend changes |
| **Prettier**            | Code formatting                 |
| **Husky + lint-staged** | Pre-commit formatting hooks     |

---

## 📁 Project Structure

```
streamora/
├── backend/
│   ├── public/                     # Static file serving directory
│   └── src/
│       ├── controllers/            # Route handler logic
│       │   ├── user.controllers.js
│       │   ├── video.controller.js
│       │   ├── comment.controller.js
│       │   ├── like.controller.js
│       │   ├── playlist.controller.js
│       │   ├── subscription.controller.js
│       │   ├── tweet.controller.js
│       │   └── dashboard.controller.js
│       ├── db/
│       │   └── index.js            # MongoDB connection
│       ├── middlewares/
│       │   ├── auth.middleware.js   # JWT verify (required + optional)
│       │   ├── multer.middleware.js # File upload handling
│       │   ├── rateLimit.middleware.js # API rate limiters
│       │   └── error.middleware.js  # Centralized error handler
│       ├── models/                 # Mongoose schemas
│       │   ├── user.models.js
│       │   ├── video.models.js
│       │   ├── comment.models.js
│       │   ├── like.models.js
│       │   ├── playlist.models.js
│       │   ├── subscription.models.js
│       │   ├── tweet.models.js
│       │   └── videoView.models.js
│       ├── routes/                 # Express routers
│       │   ├── user.routes.js
│       │   ├── video.routes.js
│       │   ├── comment.routes.js
│       │   ├── like.routes.js
│       │   ├── playlist.routes.js
│       │   ├── subscription.routes.js
│       │   ├── tweet.routes.js
│       │   ├── dashboard.routes.js
│       │   └── health.routes.js
│       ├── utils/
│       │   ├── asynchandler.js     # Async error wrapper
│       │   ├── Apireject.js        # Standardized API error class
│       │   ├── Apiresolved.js      # Standardized API success class
│       │   └── claudinary.js       # Cloudinary upload/delete helpers
│       ├── app.js                  # Express app setup (CORS, routes, middleware)
│       ├── constants.js
│       └── index.js                # Server entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js           # Navigation bar
│   │   │   ├── Sidebar.js          # Side navigation
│   │   │   ├── Layout.js           # Page shell wrapper
│   │   │   └── VideoCard.js        # Reusable video card component
│   │   ├── context/
│   │   │   └── authContext.js      # Auth state (in-memory store)
│   │   ├── css/                    # Global styles
│   │   ├── hooks/                  # Reusable logic hooks
│   │   ├── pages/
│   │   │   ├── HomePage.js         # Video feed
│   │   │   ├── WatchPage.js        # Video player + comments
│   │   │   ├── ChannelPage.js      # Public channel profile
│   │   │   ├── DashboardPage.js    # Creator dashboard
│   │   │   ├── TweetFeedPage.js    # Community tweets
│   │   │   ├── PlaylistPage.js     # Playlist viewer
│   │   │   ├── LoginPage.js
│   │   │   └── SignupPage.js
│   │   ├── services/               # Axios API call wrappers
│   │   ├── utils/                  # Utility helpers
│   │   ├── router.js               # Hash-based SPA router
│   │   └── main.js                 # App entry point
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── .env                            # Root environment variables
├── .prettierrc                     # Prettier config
├── .husky/                         # Git hooks
├── package.json                    # Root scripts (monorepo-style)
└── README.md
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (Browser)                   │
│              Vanilla JS SPA — Vite + TailwindCSS        │
│          Hash Router: /#/, /#/watch/:id, etc.           │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTPS (Axios + HTTP-only Cookies)
┌─────────────────────▼───────────────────────────────────┐
│               Express.js REST API (Node.js)             │
│                                                         │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐ │
│  │ Rate Limit │  │    CORS    │  │  Auth Middleware   │ │
│  │ Middleware │  │ Middleware │  │   (JWT Verify)     │ │
│  └────────────┘  └────────────┘  └───────────────────┘ │
│                                                         │
│  Routes: /api/v1/{user,videos,comments,likes,           │
│           playlists,subscriptions,tweets,dashboard}     │
└──────────┬──────────────────────────┬───────────────────┘
           │                          │
┌──────────▼──────────┐   ┌───────────▼───────────────────┐
│   MongoDB Atlas     │   │         Cloudinary             │
│  (Mongoose ODM)     │   │   (Video + Image Storage)      │
│  8 data models      │   │   Upload / Delete via SDK      │
└─────────────────────┘   └───────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (ships with Node.js)
- A **MongoDB Atlas** account — [Sign up free](https://www.mongodb.com/atlas)
- A **Cloudinary** account — [Sign up free](https://cloudinary.com)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HarshalPatil-HP/VideoTube.git
   cd VideoTube
   ```

2. **Install all dependencies** (root + frontend)

   ```bash
   npm install
   npm install --prefix frontend
   ```

3. **Set up environment variables** (see below)

4. **Start the development servers** (in two terminals)

### Environment Variables

Create a `.env` file in the **root** of the project:

```env
# ── Server ──────────────────────────────────────
PORT=8000

# ── CORS ────────────────────────────────────────
# Production: your deployed frontend URL
# Development: leave this unset; localhost is allowed automatically
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# ── MongoDB ─────────────────────────────────────
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/<dbname>

# ── JWT ─────────────────────────────────────────
ACCESS_TOKEN=your_access_token_secret_here
ACCESS_EXPIRY=1d

REFRESH_TOKEN=your_refresh_token_secret_here
REFRESH_EXPIRY=10d

# ── Cloudinary ──────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> **⚠️ Important:** Never commit your `.env` file. It is already listed in `.gitignore`.

### Running Locally

**Terminal 1 — Backend API** (runs on `http://localhost:8000`):

```bash
npm run dev
```

**Terminal 2 — Frontend Dev Server** (runs on `http://localhost:5173`):

```bash
npm run dev:frontend
```

Open your browser at **http://localhost:5173**.

---

## 📡 API Reference

All API routes are prefixed with `/api/v1`.

### Healthcheck

| Method | Route          | Auth | Description       |
| ------ | -------------- | ---- | ----------------- |
| `GET`  | `/healthcheck` | None | API health status |

### Users — `/user`

| Method   | Route               | Auth        | Description                               |
| -------- | ------------------- | ----------- | ----------------------------------------- |
| `POST`   | `/register`         | None        | Register new user (avatar + cover upload) |
| `POST`   | `/login`            | None        | Login, receive access + refresh tokens    |
| `POST`   | `/logout`           | ✅ Required | Invalidate session                        |
| `POST`   | `/refresh-token`    | None        | Rotate refresh token                      |
| `GET`    | `/profile`          | ✅ Required | Get authenticated user profile            |
| `PATCH`  | `/profile/update`   | ✅ Required | Update fullname / email                   |
| `PATCH`  | `/profile-password` | ✅ Required | Change password                           |
| `PATCH`  | `/profile/avatar`   | ✅ Required | Update avatar image                       |
| `DELETE` | `/profile/avatar`   | ✅ Required | Remove avatar                             |
| `PATCH`  | `/profile/cover`    | ✅ Required | Update cover image                        |
| `DELETE` | `/profile/cover`    | ✅ Required | Remove cover                              |
| `GET`    | `/channel/:uname`   | Optional    | Get public channel profile                |
| `GET`    | `/watch-history`    | ✅ Required | Get user watch history                    |

### Videos — `/videos`

| Method   | Route                      | Auth        | Description                              |
| -------- | -------------------------- | ----------- | ---------------------------------------- |
| `GET`    | `/`                        | None        | Get paginated video feed (search/filter) |
| `POST`   | `/`                        | ✅ Required | Upload a new video                       |
| `GET`    | `/:videoId`                | Optional    | Get a single video by ID                 |
| `PATCH`  | `/:videoId`                | ✅ Required | Update video title/description/thumbnail |
| `DELETE` | `/:videoId`                | ✅ Required | Delete a video                           |
| `PATCH`  | `/toggle/publish/:videoId` | ✅ Required | Toggle publish status                    |

### Comments — `/comments`

| Method   | Route           | Auth        | Description              |
| -------- | --------------- | ----------- | ------------------------ |
| `GET`    | `/:videoId`     | None        | Get comments for a video |
| `POST`   | `/:videoId`     | ✅ Required | Add a comment            |
| `PATCH`  | `/c/:commentId` | ✅ Required | Edit a comment           |
| `DELETE` | `/c/:commentId` | ✅ Required | Delete a comment         |

### Likes — `/likes`

| Method | Route                  | Auth        | Description             |
| ------ | ---------------------- | ----------- | ----------------------- |
| `POST` | `/toggle/v/:videoId`   | ✅ Required | Like / unlike a video   |
| `POST` | `/toggle/c/:commentId` | ✅ Required | Like / unlike a comment |
| `POST` | `/toggle/t/:tweetId`   | ✅ Required | Like / unlike a tweet   |
| `GET`  | `/videos`              | ✅ Required | Get all liked videos    |

### Playlists — `/playlists`

| Method   | Route                          | Auth        | Description                      |
| -------- | ------------------------------ | ----------- | -------------------------------- |
| `POST`   | `/`                            | ✅ Required | Create a playlist                |
| `GET`    | `/:playlistId`                 | None        | Get playlist by ID               |
| `PATCH`  | `/:playlistId`                 | ✅ Required | Update playlist name/description |
| `DELETE` | `/:playlistId`                 | ✅ Required | Delete a playlist                |
| `POST`   | `/add/:videoId/:playlistId`    | ✅ Required | Add video to playlist            |
| `DELETE` | `/remove/:videoId/:playlistId` | ✅ Required | Remove video from playlist       |
| `GET`    | `/user/:userId`                | None        | Get all playlists by a user      |

### Subscriptions — `/subscriptions`

| Method | Route              | Auth        | Description             |
| ------ | ------------------ | ----------- | ----------------------- |
| `POST` | `/c/:channelId`    | ✅ Required | Subscribe / unsubscribe |
| `GET`  | `/c/:channelId`    | ✅ Required | Get channel subscribers |
| `GET`  | `/u/:subscriberId` | ✅ Required | Get subscribed channels |

### Tweets — `/tweets`

| Method   | Route       | Auth        | Description                |
| -------- | ----------- | ----------- | -------------------------- |
| `GET`    | `/`         | None        | Get all tweets (paginated) |
| `POST`   | `/`         | ✅ Required | Create a tweet             |
| `PATCH`  | `/:tweetId` | ✅ Required | Update a tweet             |
| `DELETE` | `/:tweetId` | ✅ Required | Delete a tweet             |

### Dashboard — `/dashboard`

| Method | Route     | Auth        | Description                                       |
| ------ | --------- | ----------- | ------------------------------------------------- |
| `GET`  | `/stats`  | ✅ Required | Channel stats (views, likes, subscribers, videos) |
| `GET`  | `/videos` | ✅ Required | All videos by authenticated creator               |

---

## 🖥 Frontend Routes

The frontend uses a **custom hash-based router** (`#/path`):

| Hash Route            | Page                    | Access       |
| --------------------- | ----------------------- | ------------ |
| `#/`                  | Home — video feed       | Public       |
| `#/watch/:id`         | Video player + comments | Public       |
| `#/tweets`            | Community tweet feed    | Public       |
| `#/channel/:username` | Creator channel profile | Public       |
| `#/playlist/:id`      | Playlist viewer         | Public       |
| `#/dashboard`         | Creator dashboard       | 🔒 Protected |
| `#/login`             | Login form              | Guest only   |
| `#/signup`            | Registration form       | Guest only   |

---

## 🗄 Data Models

### User

| Field          | Type       | Notes                      |
| -------------- | ---------- | -------------------------- |
| `uname`        | String     | Unique, indexed, lowercase |
| `email`        | String     | Unique                     |
| `fullname`     | String     | Indexed                    |
| `password`     | String     | Bcrypt hashed              |
| `avatar`       | String     | Cloudinary URL             |
| `cover`        | String     | Cloudinary URL (optional)  |
| `watchHistory` | ObjectId[] | Refs → Video               |
| `refreshtoken` | String     | Rotated on each refresh    |

### Video

| Field            | Type     | Notes          |
| ---------------- | -------- | -------------- |
| `title`          | String   | Required       |
| `discription`    | String   | Required       |
| `videofile`      | String   | Cloudinary URL |
| `thumbnail`      | String   | Cloudinary URL |
| `owner`          | ObjectId | Ref → User     |
| `views`          | Number   | Default 0      |
| `durationNumber` | Number   | In seconds     |
| `isPublished`    | Boolean  | Default true   |

> Other models: **Comment**, **Like**, **Playlist**, **Subscription**, **Tweet**, **VideoView**

---

## 🔐 Security

| Measure                        | Implementation                                                      |
| ------------------------------ | ------------------------------------------------------------------- |
| **Password hashing**           | bcrypt with 10 salt rounds                                          |
| **Auth tokens**                | Short-lived JWT (1d) + refresh token (10d) in HTTP-only cookies     |
| **CORS**                       | Environment-aware allowlist; `credentials: true`                    |
| **General rate limiting**      | 1,000 req / 15 min per IP                                           |
| **Auth endpoint limiting**     | 20 req / 15 min per IP                                              |
| **Signup limiting**            | 500 accounts / hr per IP                                            |
| **File validation**            | Multer MIME-type & size checks                                      |
| **Centralized error handling** | Standardized `ApiError` class; no stack traces leaked in production |
| **Proxy trust**                | `app.set("trust proxy", 1)` for accurate IP behind reverse proxies  |

---

## ☁️ Deployment

### Backend (e.g. Render / Railway)

1. Set all environment variables in the platform dashboard (see [Environment Variables](#environment-variables)).
2. Set **Start Command**: `npm start`
3. Set `NODE_ENV=production`
4. Ensure `CORS_ORIGIN` matches your exact deployed frontend URL.

### Frontend (Vercel)

1. Set **Root Directory** to `frontend/`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`

> The live deployment is at **https://streamora-murex.vercel.app**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and ensure formatting passes: `npx prettier --check .`
4. **Commit** your changes using Conventional Commits: `git commit -m "feat: add your feature"`
5. **Push** to the branch: `git push origin feature/your-feature-name`
6. Open a **Pull Request**

> Pre-commit hooks (Husky + lint-staged) will automatically format all staged files before each commit.

---

## 📄 License

Distributed under the **ISC License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

Made with ❤️ by **Harshal Patil**

⭐ Star this repo if you found it useful!

</div>
