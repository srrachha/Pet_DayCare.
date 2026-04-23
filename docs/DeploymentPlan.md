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

## 4. Cloud Deployment (Render/Railway)
- **Web Service (Backend):**
    - Connect GitHub repo.
    - Root Directory: `backend`
    - Build Command: `npm install`
    - Start Command: `node server.js`
- **Static Site (Frontend):**
    - Root Directory: `frontend`
    - Build Command: `npm run build`
    - Publish Directory: `dist`
- **Database:**
    - Since SQLite is file-based, ensure a persistent disk is attached to the backend service.

## 5. Security Checklist
- [ ] Change default `JWT_SECRET`.
- [ ] Disable directory listing on server.
- [ ] Set `NODE_ENV=production`.
- [ ] Use HTTPS for all communications.
