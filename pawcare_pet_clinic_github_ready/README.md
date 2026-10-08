# PawCare Pet Clinic

A responsive pet clinic appointment-booking website built with HTML, CSS and JavaScript.

## Features

- Responsive mobile-first design
- Home, Services, Doctors, Booking, My Appointments, About/Contact, Testimonials and FAQ
- Appointment form with validation
- Doctor-specific working days
- Only available time slots are displayed
- Double-booking prevention
- Booking confirmation summary
- Lookup appointments by phone number
- Reschedule and cancel bookings
- Demo admin login
- Admin appointment table with date/doctor/status filters
- Approve, reject and complete appointments
- Add doctors from the admin panel
- Dark mode
- WhatsApp button
- localStorage persistence
- Clean structure suitable for GitHub Pages

## Run

No installation is required.

1. Download/clone the project.
2. Open `index.html` in a browser.

For best results in development, use VS Code + Live Server.

## Demo Admin

Username: `admin`

Password: `admin123`

## Important

This is a frontend demo. localStorage is NOT a secure database and the admin login is NOT secure authentication.

For production, replace the localStorage functions in `js/app.js` with API requests to a Node.js/Express backend and use MongoDB/MySQL.

Suggested API:

- `POST /api/appointments`
- `GET /api/appointments?phone=...`
- `PATCH /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/doctors`
- `POST /api/doctors`
- `PUT /api/doctors/:id`
- `GET /api/services`
- `POST /api/services`

Production double-booking protection should be enforced by the database with a unique constraint/index on `(doctorId, date, time)` and a server-side availability check.

## GitHub Pages

This project can be published directly as a static site because it uses no build step.

Push the project to GitHub, then enable GitHub Pages from the repository's Pages settings and choose the main branch/root folder.
