# INSTALL.md — Step-by-Step Setup Guide

Follow every step in order. Do not skip.

---

## Step 1 — Install VS Code Extensions

Open VS Code -> Extensions (Ctrl+Shift+X) -> install each:

1. GitHub Copilot          (GitHub)
2. GitHub Copilot Chat     (GitHub)
3. Python                  (Microsoft)
4. Pylance                 (Microsoft)
5. ES7+ React/Redux        (dsznajder)
6. Tailwind CSS IntelliSense (Tailwind Labs)
7. Thunder Client          (Ranga Vadhineni)  <- API testing inside VS Code
8. Error Lens              (Alexander)

---

## Step 2 — Verify System Requirements

Open terminal and check:
```
python --version     # need 3.11 or higher
node --version       # need 20 or higher
git --version        # need any version
```

Install if missing:
- Python: https://www.python.org/downloads/
- Node:   https://nodejs.org/en/download (choose LTS)
- Git:    https://git-scm.com/downloads

---

## Step 3 — Open Project in VS Code

```
File -> Open Folder -> select zorvyn-finance folder
```

You will see the full folder tree in the Explorer panel.

---

## Step 4 — Backend Setup

Open terminal in VS Code (Ctrl+backtick):

```bash
cd apps/api

# Create virtual environment
python -m venv venv

# Activate (choose your OS):
source venv/bin/activate          # macOS / Linux
.\venv\Scripts\activate           # Windows PowerShell
.\venv\Scripts\activate.bat       # Windows CMD

# You will see (venv) prefix in terminal after activation

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
```

Now open apps/api/.env and fill in two values:
1. DATABASE_URL — from Supabase (see Step 5)
2. SECRET_KEY — run this command to generate one:
   python -c "import secrets; print(secrets.token_hex(32))"

---

## Step 5 — Supabase Database Setup

1. Go to https://supabase.com -> Sign up -> New Project
2. Name: zorvyn-finance -> choose region -> Create Project
3. Wait ~2 minutes for project to start
4. Go to: Project Settings -> Database -> Connection String -> URI
5. Copy the connection string (it looks like: postgresql://postgres:...)
6. Paste into apps/api/.env as DATABASE_URL
   Replace [YOUR-PASSWORD] with your Supabase project password

7. Run migrations — in Supabase dashboard -> SQL Editor:
   Open and run each file in infra/supabase/migrations/ ONE BY ONE in order:
   001 -> 002 -> 003 -> 004 -> 005 -> 006 -> 007

8. Generate real bcrypt hashes for seed.sql:
   python -c "from passlib.context import CryptContext; print(CryptContext(['bcrypt']).hash('admin123'))"
   Replace $2b$12$REPLACE_WITH_REAL_ADMIN_HASH in infra/supabase/seed.sql
   Do the same for analyst123 and viewer123

9. Run seed.sql in Supabase SQL Editor

---

## Step 6 — Verify Backend Works

```bash
# In apps/api terminal (with venv active):
uvicorn main:app --reload --port 8000
```

Open in browser:
- http://localhost:8000/health  -> should show {"status":"ok","timestamp":"..."}
- http://localhost:8000/ready   -> should show {"status":"ok","db":"connected"}
- http://localhost:8000/docs    -> should show Swagger UI with all endpoints

If ready shows "db":"unreachable" — check DATABASE_URL in .env

---

## Step 7 — Frontend Setup

Open a SECOND terminal in VS Code:

```bash
cd apps/web
npm install
cp .env.example .env.local
```

The .env.local already has: NEXT_PUBLIC_API_URL=http://localhost:8000
No changes needed for local development.

---

## Step 8 — Run Full Stack

Keep both terminals running:

Terminal 1 (backend):
```bash
cd apps/api && source venv/bin/activate
uvicorn main:app --reload --port 8000
```

Terminal 2 (frontend):
```bash
cd apps/web
npm run dev
```

Open http://localhost:3000 — you should see the login page.

Login with seeded users:
- admin@zorvyn.dev / admin123
- analyst@zorvyn.dev / analyst123
- viewer@zorvyn.dev / viewer123

---

## Step 9 — Run Tests

```bash
# Backend (in apps/api with venv active):
pytest -v

# Frontend:
cd apps/web && npm test
```

---

## Step 10 — Start Copilot Development

You are ready. Open COPILOT_GUIDE.md and follow the sessions in order.

First: copy the "First Prompt" at the top of COPILOT_GUIDE.md into Copilot Chat.
Then: follow Session 1, 2, 3... in sequence.

Keyboard shortcuts:
- Open Copilot Chat: Ctrl+Shift+I (Windows) / Cmd+Shift+I (macOS)
- Accept suggestion:  Tab
- Dismiss suggestion: Escape
