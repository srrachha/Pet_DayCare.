# Deployment Plan
## Pet Daycare & Boarding System

---

## 1. Prerequisites
- Node.js 18+
- NPM or Yarn
- SQLite3 CLI (Optional for debugging)

## 2. Local Setup
1. Clone the repository.
2. `cd backend && npm install`
3. Create `.env` file with `JWT_SECRET` and `PORT`.
4. `node server.js`
5. `cd ../frontend && npm install`
6. `npm run dev`

## 3. Production Build
1. **Frontend:**
    - `npm run build`
    - Output will be in `frontend/dist`.
2. **Backend:**
    - Use `pm2` or a similar process manager to keep the server running.
    - Serve the `frontend/dist` static files through the Express server or an Nginx proxy.

## 4. Unified Deployment (Recommended)
1. **GitHub Repository**: Ensure your latest code is pushed to GitHub.
2. **Platform (Render/Railway)**:
    - **Service Type**: Web Service (Node).
    - **Root Directory**: `.` (The project root).
    - **Build Command**: `npm run build`
    - **Start Command**: `npm start`
3. **Environment Variables**:
    - `JWT_SECRET`: Your production secret.
    - `PORT`: `5000` (or leave blank for platform default).
4. **Important Note (SQLite)**: On free tiers (like Render Free), data in SQLite will be reset on every restart. For production, consider using a managed database (MongoDB, Postgres).

## 5. Security Checklist
- [ ] Change default `JWT_SECRET`.
- [ ] Set `NODE_ENV=production`.
- [ ] Use HTTPS for all communications.
