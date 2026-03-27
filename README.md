# Elder Health Monitoring System

Monorepo with:

- `backend/` → Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt
- `frontend/` → Next.js (App Router) + Tailwind CSS + TanStack Query + Axios

## 1) Folder structure

```
elder-health-app/
  backend/
    src/
      config/
        db.js
        env.js
      middleware/
        authMiddleware.js
        errorHandler.js
        roleMiddleware.js
      models/
        Health.js
        User.js
      routes/
        alerts.js
        auth.js
        health.js
        index.js
        patient.js
      utils/
        healthLogic.js
        jwt.js
      server.js
    .env.example
    package.json
  frontend/
    src/
      app/
        dashboard/page.tsx
        login/page.tsx
        register/page.tsx
        layout.tsx
        page.tsx
        providers.tsx
        globals.css
      components/
        AppShell.tsx
        ui/
          Badge.tsx
          Button.tsx
          Card.tsx
          Input.tsx
      lib/
        api.ts
        auth.ts
    .env.example
    package.json
  package.json
```

## 2) Backend setup code (APIs + rules)

### Endpoints (implemented)

- `POST /auth/register`
- `POST /auth/login`
- `POST /api/health` (requires `care_manager`)
- `GET /api/patient/:id` (any authenticated role)
- `GET /api/alerts` (any authenticated role)

### Health alert rules (exact)

- `heartRate < 50 OR > 110` → **Alert**
- `oxygen < 92` → **Critical**
- `bp systolic > 140 OR diastolic > 90` → **Warning**

Priority: `Critical > Alert > Warning > Normal`

## 3) Frontend setup code (role dashboards)

- **Login**: authenticates and stores JWT + user in `localStorage`
- **Register**: live password validation (red border + “Strong password required”)
- **Dashboard**:
  - `care_manager`: can submit readings
  - `parent`: view readings + emergency button (UI only)
  - `child`: view-only
- **TanStack Query** used for all API calls
- **Axios interceptor** attaches `Authorization: Bearer <token>`

## 4) Installation steps

From the monorepo root:

```bash
cd elder-health-app
```

### Backend env

Copy and fill:

```bash
copy backend\\.env.example backend\\.env
```

Set at least:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGIN` (default `http://localhost:3000`)

### Frontend env

```bash
copy frontend\\.env.example frontend\\.env.local
```

Set:

- `NEXT_PUBLIC_API_URL=http://localhost:5000`

## 5) Run commands (local dev)

### Run both (recommended)

```bash
npm run dev
```

### Or separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:5000/healthz`

## 6) Deployment steps (Vercel + Render)

### Backend on Render

1. Create a new **Web Service** from your repo.
2. **Root directory**: `backend`
3. **Build command**: `npm install`
4. **Start command**: `npm run start`
5. Add environment variables in Render:
   - `NODE_ENV=production`
   - `PORT=10000` (Render sets `PORT`, but it’s fine to rely on it)
   - `MONGODB_URI=...`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=7d`
   - `CLIENT_ORIGIN=https://<your-vercel-domain>`
6. Ensure your MongoDB is reachable (MongoDB Atlas recommended).

### Frontend on Vercel

1. Import project into Vercel.
2. **Root directory**: `frontend`
3. Add env var:
   - `NEXT_PUBLIC_API_URL=https://<your-render-backend-domain>`
4. Deploy.

