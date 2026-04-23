# System Design Document
## Pet Daycare & Boarding System

---

## 1. Architectural Overview
The PDBS follows a **Full-Stack JavaScript Architecture** with a decoupled Frontend and Backend.

- **Frontend:** React + Vite (SPA)
- **Backend:** Node.js + Express (RESTful API)
- **Database:** SQLite3 (Relational)
- **Styling:** Vanilla CSS (Direct & Performant)

## 2. Component Design

### 2.1 Backend Modules
- **`server.js`**: Application entry point and middleware configuration.
- **`db.js`**: Database connection and schema initialization.
- **`routes/auth.js`**: Role-based authentication (Register/Login).
- **`routes/pets.js`**: Pet profile management endpoints.
- **`routes/bookings.js`**: Stay reservation and status tracking logic.
- **`middleware/auth.js`**: JWT verification and role-based guard.

### 2.2 Frontend Architecture
- **App.jsx**: Main router and theme provider.
- **Components**:
    - `Navbar`: Responsive navigation with role-based links.
    - `PetCard`: Visual card for pet information.
    - `BookingForm`: Interactive calendar and date selection.
    - `StatusTimeline`: Real-time update feed.
- **Pages**:
    - `Login`: Unified login with role detection.
    - `AdminDashboard`: Global overview for facility owners.
    - `UserDashboard`: Personalized view for pet parents.

## 3. Database Schema Details

### Tables
1. **`users`**: Stores credentials and roles (`admin` vs `user`).
2. **`pets`**: Extended attributes for pet care (breed, medical notes).
3. **`bookings`**: Tracks reservations with state machine logic (`pending` -> `confirmed` -> `completed`).
4. **`pet_status`**: Event-driven log for pet activities during a stay.

## 4. API Specification (Selected Endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create new account | None |
| POST | `/api/auth/login` | Obtain JWT token | None |
| GET | `/api/pets` | List pets (context-aware) | User/Admin |
| POST | `/api/bookings` | Request a stay | User |
| PATCH | `/api/bookings/:id/status` | Confirm/Cancel stay | Admin |
| POST | `/api/bookings/:id/status_update` | Add activity log | Admin |

## 5. UI/UX Design Principles
- **Aesthetic:** Modern Dark Mode (Glassmorphism inspired).
- **Responsiveness:** Fluid grid layout for mobile/desktop.
- **Feedback:** Toast notifications for success/error states.
