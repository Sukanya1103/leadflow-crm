# LeadFlow CRM

A web-based **Customer Relationship Management (CRM) and Sales Pipeline** system built with the **MERN stack**. LeadFlow CRM helps sales teams capture leads, assign them to team members, track deals through a drag-and-drop pipeline, log customer interactions, and view sales analytics, all in one place.

**Live demo:** [https://leadflow-crm-seven-tau.vercel.app](https://leadflow-crm-seven-tau.vercel.app)

> The backend runs on a free hosting plan and goes to sleep when idle, so the first request after a break can take up to a minute.

---

## Features

- **Authentication and Role-Based Access:** secure JWT login with separate permissions for Admin, Manager and Sales Representative
- **Lead Management:** create, edit, search, filter and delete leads
- **Lead Assignment:** admins and managers assign leads to sales reps
- **Drag-and-Drop Sales Pipeline:** Kanban board with stages: Prospect, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
- **Customer Interaction History:** timeline of calls, emails, meetings and notes for every lead
- **Follow-up Reminders:** notification bell for overdue and due-today follow-ups, plus an optional daily email digest
- **Dashboard and Analytics:** stat cards, pipeline chart, monthly sales, lead sources and upcoming follow-ups
- **Team Management:** create teams, assign managers and members, change roles, activate or deactivate users
- **Team-wise Sales Reports:** revenue, conversion rate and sales leaderboard with a date range filter

---

## Screenshots

| Dashboard | Sales Pipeline |
|---|---|
| ![Dashboard](docs/dashboard.png) | ![Pipeline](docs/pipeline.png) |

| Lead Details | Team Reports |
|---|---|
| ![Lead details](docs/lead-details.png) | ![Reports](docs/reports.png) |

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React (Vite), Tailwind CSS, Zustand, TanStack Query, React Router, Axios, Recharts, @hello-pangea/dnd |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT), bcryptjs |
| Others | node-cron, Nodemailer |
| Hosting | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project Structure

```
leadflow-crm/
├── frontend/                  # React app (Vite)
│   └── src/
│       ├── components/        # Sidebar, Navbar, forms, stat cards
│       ├── hooks/             # TanStack Query hooks
│       ├── pages/             # Dashboard, Leads, Pipeline, Reports, Team...
│       ├── services/          # Axios instance
│       ├── store/             # Zustand auth store
│       └── App.jsx
└── backend/                   # Express API
    ├── config/                # Database connection
    ├── controllers/
    ├── middleware/            # Auth and role checks
    ├── models/                # User, Team, Lead, Activity
    ├── routes/
    ├── utils/                 # Token generator, reminder job
    └── server.js
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or above)
- A MongoDB database (MongoDB Atlas free cluster or local MongoDB)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Sukanya1103/leadflow-crm.git
cd leadflow-crm
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend/` (use `.env.example` as a template):

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

To point the frontend to a different API, create `frontend/.env` with:

```env
VITE_API_URL=http://localhost:5000/api
```

> The **first user who registers automatically becomes the Admin**. Everyone after that registers as a Sales Rep, and the Admin can change roles from the Team page.

### Optional: email reminders

Add these to `backend/.env` to receive a daily follow-up digest at 9 AM IST (without them, reminders still show in the app):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=LeadFlow CRM <your_email@gmail.com>
```

---

## Environment Variables

**Backend (`backend/.env`)**

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma separated, no trailing slash |
| `EMAIL_*` | Optional, SMTP settings for reminder emails |
| `REMINDER_CRON` | Optional, cron schedule of the reminder job (default `0 9 * * *`) |

**Frontend (`frontend/.env`)**

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL, ending with `/api` |

---

## Deployment

| Part | Platform | Notes |
|---|---|---|
| Frontend | Vercel | Root directory `frontend`, env var `VITE_API_URL`, `vercel.json` handles page refresh on routes |
| Backend | Render | Root directory `backend`, build `npm install`, start `npm start`, env vars from the table above |
| Database | MongoDB Atlas | Allow access from `0.0.0.0/0` so the hosted backend can connect |

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access: all leads, users, teams, roles and reports |
| **Manager** | All leads, assign and delete leads, reports (own team only if a team is set) |
| **Sales Rep** | View and update only the leads assigned to them |

---

## API Overview

All routes except register and login need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |
| GET | `/api/auth/me` | Current user profile | Logged in |
| GET | `/api/leads` | List leads (search and filters) | Logged in |
| POST | `/api/leads` | Create a lead | Logged in |
| GET | `/api/leads/:id` | Lead details | Logged in |
| PUT | `/api/leads/:id` | Update a lead | Logged in |
| PATCH | `/api/leads/:id/stage` | Change pipeline stage | Logged in |
| PATCH | `/api/leads/:id/assign` | Assign a lead to a user | Admin, Manager |
| DELETE | `/api/leads/:id` | Delete a lead | Admin, Manager |
| GET | `/api/activities/lead/:leadId` | Interaction history of a lead | Logged in |
| POST | `/api/activities/lead/:leadId` | Log a call, email, meeting or note | Logged in |
| DELETE | `/api/activities/:id` | Delete an activity | Owner, Admin, Manager |
| GET | `/api/dashboard/stats` | Dashboard statistics | Logged in |
| GET | `/api/reminders` | Your due and overdue follow-ups | Logged in |
| POST | `/api/reminders/send-now` | Run the reminder email job now | Admin |
| GET | `/api/users` | List users | Admin, Manager |
| PATCH | `/api/users/:id` | Change role, team or status | Admin |
| GET | `/api/teams` | List teams | Admin, Manager |
| POST | `/api/teams` | Create a team | Admin |
| PUT | `/api/teams/:id` | Update a team | Admin |
| DELETE | `/api/teams/:id` | Delete a team | Admin |
| GET | `/api/reports/team` | Team-wise sales report | Admin, Manager |

---

## Roadmap

- [x] Deployment (Vercel + Render + MongoDB Atlas)
- [ ] CSV import / export of leads
- [ ] Audit logs
- [ ] Docker setup

---

## Author

**Sukanya**
GitHub: [@Sukanya1103](https://github.com/Sukanya1103)

---

## License

This project is built for educational purposes as part of a college project.
