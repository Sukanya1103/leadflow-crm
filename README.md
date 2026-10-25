# LeadFlow CRM

A web-based **Customer Relationship Management (CRM) and Sales Pipeline** system built with the **MERN stack**. LeadFlow CRM helps sales teams capture leads, assign them to team members, track deals through a drag-and-drop pipeline, log customer interactions, and view sales analytics, all in one place.

---

## Features

- **Authentication and Role-Based Access:** secure JWT login with separate permissions for Admin, Manager and Sales Representative
- **Lead Management:** create, edit, search, filter and delete leads
- **Lead Assignment and Follow-up Reminders:** assign leads to sales reps and get reminders for upcoming follow-ups
- **Drag-and-Drop Sales Pipeline:** move deals across stages: Prospect, Qualification, Proposal, Negotiation, Closed Won / Lost
- **Customer Interaction History:** timeline of calls, emails, meetings and notes for every lead
- **Dashboard and Analytics:** active leads, pipeline funnel, monthly sales and lead source charts
- **Team-wise Sales Reports:** compare performance and revenue across teams

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js (Vite), Tailwind CSS, Recharts, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JSON Web Tokens (JWT), bcrypt |
| Others | node-cron, Nodemailer, dnd-kit / hello-pangea-dnd |

---

## Project Structure

```
leadflow-crm/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node + Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or above)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/Sukanya1103/leadflow-crm.git
cd leadflow-crm
```

2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside `server/`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_app_password
```

Start the server:

```bash
npm run dev
```

3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT |
| GET | `/api/leads` | Get all leads (role-based) |
| POST | `/api/leads` | Create a lead |
| PATCH | `/api/leads/:id/stage` | Update pipeline stage |
| PATCH | `/api/leads/:id/assign` | Assign lead to a user |
| GET | `/api/leads/:id/activities` | Get interaction history |
| POST | `/api/leads/:id/activities` | Log a call, email, meeting or note |
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/reports/team` | Team-wise sales report |

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access: users, teams, all leads and reports |
| **Manager** | Manage own team, assign leads, view team reports |
| **Sales Rep** | View and update only own assigned leads |

---

## Roadmap

- [ ] CSV import / export of leads
- [ ] Email notifications for follow-ups
- [ ] Audit logs
- [ ] Docker setup
- [ ] Deployment (Vercel + Render + MongoDB Atlas)

---

## Screenshots

_Add screenshots of the dashboard, pipeline and lead details page here._

---

## Author

**Sukanya Rana**
GitHub: [@Sukanya1103](https://github.com/Sukanya1103)

---

## License

This project is built for educational purposes as part of a college project.
