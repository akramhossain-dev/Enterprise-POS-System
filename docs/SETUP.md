# Installation & Setup Guide — Enterprise POS System

Welcome to the Enterprise POS System repository! This guide provides a comprehensive walkthrough for setting up your local development environment from scratch, initializing databases, and configuring services.

---

## 📋 System Prerequisites

Before starting, verify you have the following installed:

- **Node.js:** `v20.x` LTS (or higher)
- **pnpm:** `v9.x` (Recommended package manager for workspace monorepos)
- **Docker & Docker Compose:** Container runtimes for running backend dependencies
- **Git:** Version control

---

## 🛠️ Step-by-Step Installation

### 1. Clone the Codebase

Clone the project repository to your local machine:

```bash
git clone https://github.com/akramhossain-dev/Enterprise-POS-System.git
cd Enterprise-POS-System
```

### 2. Install Dependencies

Initialize the monorepo workspace dependencies:

```bash
pnpm install
```

### 3. Setup Environment Variables

Duplicate the environment template files and customize settings for both applications:

- **Backend API (`apps/api/.env`):**
  ```bash
  cp apps/api/.env.example apps/api/.env
  ```
- **Frontend Client (`apps/web/.env.local`):**
  ```bash
  cp apps/web/.env.example apps/web/.env.local
  ```

---

## ⚙️ Environment Reference Configuration

### API Backend Settings (`apps/api/.env`)

Ensure these values match your local database and cache setup:

```env
NODE_ENV=development
PORT=4000
APP_NAME="Enterprise POS API"

# PostgreSQL Database (Prisma format)
DATABASE_URL="postgresql://pos_user:pos_password@localhost:5432/enterprise_pos"

# Redis Cache connection
REDIS_URL="redis://localhost:6379"

# Client CORS allowance
FRONTEND_URL="http://localhost:3000"

# JWT secrets for authentication (at least 32 characters)
JWT_SECRET="your_jwt_secret_must_be_32_characters_long"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_SECRET="your_refresh_token_secret_must_be_32_characters_long"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

### Web Client Settings (`apps/web/.env.local`)

Points the Next.js client to the backend endpoint:

```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_APP_NAME="Enterprise POS"
```

---

## 🗄️ Database & Services Setup

### 1. Launch Services via Docker

Start the local PostgreSQL database and Redis caching server:

```bash
docker compose up -d postgres redis
```

### 2. Apply Database Schema (Migrations)

Run Prisma migrations to construct the database schema:

```bash
pnpm --filter @enterprise-pos/api db:migrate
```

### 3. Seed Database

Inject roles, initial workspaces, and default admin cashier accounts into the PostgreSQL database:

```bash
pnpm --filter @enterprise-pos/api db:seed
```

---

## 🚀 Running the Application

Start both the backend API server and Next.js frontend application in parallel:

```bash
pnpm dev
```

- **Frontend Application:** `http://localhost:3000`
- **Backend Gateway API:** `http://localhost:4000/api/v1`
- **Interactive API Docs (Swagger):** `http://localhost:4000/docs`

---

## 🧪 Verification & Health Checks

Verify your installation is fully operational:

1.  **Backend Health Check:**
    Open `http://localhost:4000/api/v1/health` in your browser. It should return a `200 OK` status indicator.
2.  **Run Tests:**
    Ensure unit and component integration tests execute without issues:
    ```bash
    pnpm test
    ```
3.  **Run Type Checks:**
    ```bash
    pnpm type-check
    ```

---

## 🔍 Troubleshooting & FAQs

### Mismatching Theme Classes / Corrupted UI

If overlays or popup cards load with transparent backgrounds:

- Ensure that tailwind compiler configurations are up-to-date and run `pnpm dev` with a fresh bundler cache.
- Do not write custom regular expressions targeting global theme prefixes without escaping character classes.

### Hydration Mismatch Errors on Client

If a Next.js console warning mentions that client-rendered content does not match the server-rendered HTML:

- Ensure that layout-level components using authorization state (like permissions) utilize client-side mounting guards (`useState` / `useEffect`) to render only after loading is completed on the client.

### API Returns `401 Unauthorized` Loop

If you get logged out immediately or receive unauthorized loops:

- Ensure that the browser allows `httpOnly` cookies from the backend's origin.
- Double check that both the frontend `.env.local` and backend `.env` variables have matching `JWT_SECRET` and cookie domain permissions.
