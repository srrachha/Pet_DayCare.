# Testing Report
## Pet Daycare & Boarding System

---

## 1. Testing Strategy
Our strategy focuses on ensuring data integrity and role-based access control (RBAC).

## 2. Unit Testing (Backend)
Tests conducted using `supertest` or manual Postman verification:

| Test Case | Objective | Result |
|-----------|-----------|--------|
| TC-01 | Admin cannot see other users' private pet details unless authorized. | Passed |
| TC-02 | User cannot book a stay for a pet they do not own. | Passed |
| TC-03 | Booking status transitions follow correct order. | Passed |
| TC-04 | JWT expires correctly after 1 hour. | Pending |

## 3. Integration Testing
- **Auth Flow**: Register -> Login -> Access Private Route.
- **Booking Flow**: Add Pet -> Create Booking -> Admin Confirm -> Check User History.

## 4. Manual UI Verification
- **Responsiveness**: Tested on 1920x1080 and 375x812 (iPhone X).
- **Animations**: Hover effects on cards and buttons work smoothly.
- **Theming**: Dark mode colors remain consistent across all pages.

## 5. Database Integrity
- Foreign key constraints validated between `pets` and `users`.
- Cascading deletes tested for pet removal (cleaning up bookings).

## 6. Known Issues
- Real-time updates currently require a manual page refresh (WebSockets planned for v2.0).
