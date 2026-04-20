# 📌 Events Management Platform — MERN Stack

A full‑stack **Events Management Platform** built with the **MERN** stack.  
Users can register, authenticate, create events, update them, delete them, and browse events created by others.  
The backend includes **JWT authentication**, **role‑based access**, **owner‑only permissions**, rate‑limit handling, and a fully tested API using:

- **Jest (ESM‑compatible)**
- **Supertest**
- **MongoDB Memory Server**
- **Mocked middleware (requireAuth, adminOnly)**
- **Full unit + integration test coverage**

The frontend is built with **React + TailwindCSS + DaisyUI**, offering a clean UI, modals, password toggles, smart search, pagination, and a smooth user experience.

---

## 🚀 Features Overview

### 👤 User Management
- User registration & login (JWT)
- Strong password validation
- Update profile
- Change password
- **Delete account (requires password confirmation)**
- Fetch all users / single user
- Role support: `user` and `admin`

---

## 🛠️ Admin Dashboard

A built‑in **Admin Dashboard** located at:

```
frontend/src/pages/UsersPage.jsx
```

### Admin Capabilities
- View all registered users  
- Inspect user roles and metadata  
- Navigate to user detail pages  
- Delete users (password‑protected modal)  
- Responsive grid layout  
- Graceful handling of rate‑limit responses (429)  
- Loading and empty‑state UI  
- Integrated toast notifications  

### Components
- `UserCard` — edit/delete actions  
- `RateLimitedUI` — shown on 429 responses  
- `UsersNotFound` — empty state  
- `Navbar` — navigation  
- Axios instance with auth headers  
- DaisyUI modals + Tailwind styling  

---

## 🎉 Event Management
- Create events
- Update events (owner‑only)
- Delete events (owner‑only)
- Fetch all events (with pagination)
- Fetch single event
- Fetch events created by the logged‑in user
- Events linked to the user who created them
- Categories & tags support
- Smart unified search (title, content, location, tags, categories, date)

---

## 🔍 Smart Search (Unified Search Bar)

The platform includes a single intelligent search field that matches:

- Event title  
- Event content  
- Location  
- Categories  
- Tags  
- Exact dates (`2025‑04‑01`)  
- Natural date formats (`April 5`)  

Search works seamlessly with pagination and the Load More button.

---

## 📄 Pagination & Load More

The events page supports:

- Page‑based backend pagination  
- “Load More” button  
- Smooth scroll to newly loaded items  
- Graceful empty states  
- Rate‑limit handling  

---

## 🔐 Authentication & Security
- JWT‑based authentication
- `requireAuth` middleware
- Protected routes
- Owner‑only edit/delete enforcement
- Password hashing with bcrypt
- Input validation with validator
- Password confirmation required for account deletion

---

## 🖥️ Frontend Features
- React + React Router
- TailwindCSS + DaisyUI
- Modern, responsive UI
- Event cards with metadata
- Owner‑only edit/delete buttons
- Delete confirmation modal with password input
- Password visibility toggle
- Toast notifications for all actions
- Unified search bar
- Pagination + Load More + smooth scroll

---

# 🧪 Testing (Full, Modern, ESM‑Compatible)

The backend uses a **fully modern Jest setup** compatible with:

- `"type": "module"`
- `NODE_OPTIONS=--experimental-vm-modules`
- ESM imports
- MongoMemoryServer
- Supertest

### ✔ Test Architecture

| Layer | Tools | Description |
|-------|--------|-------------|
| **Unit Tests** | Jest | Controllers (mocked models), middleware, routes |
| **Integration Tests** | Jest + Supertest + MongoMemoryServer | Real DB logic, real Express routes |
| **Middleware Tests** | Jest | Mocked JWT + DB |
| **Route Tests** | Jest + Supertest | Ensures correct controller wiring |

### ✔ Key Testing Features Added
- **setupDB.js** — spins up MongoMemoryServer, wipes DB after each test  
- **setupTests.js** — ESM‑safe mocking using `import { jest } from "@jest/globals"`  
- **Mocked requireAuth + adminOnly** using `jest.unstable_mockModule`  
- **Correct import order** (mocks before routes)  
- **Integration tests use real Mongoose models**  
- **Unit tests mock Event + User models**  
- **Full coverage of all controller branches**  
- **Stable VM Modules execution**  

### ✔ Run all tests

```bash
npm test
```

### ✔ Watch mode

```bash
npm run test:watch
```

---

# 🌱 Database Seeding (Admin User + Test Event)

The backend includes a migration/seed script that creates:

- A default **admin user**
- A default **test event**

### 📁 Location

```
backend/migrations/seed.js
```

### ▶️ Run the seed script

```bash
npm run seed
```

### 🧬 What gets created

#### Admin User
- email: `admin@test.com`  
- password: `Admin123!`  
- role: `admin`

#### Test Event
- title: `Test Event`  
- location: `Gothenburg`  
- date: `2026-01-01`  
- categories/tags: `["tech"]`, `["seed", "test"]`  
- createdBy: admin user  

The script is **idempotent** — running it multiple times will not create duplicates.

---

## 🏗️ Tech Stack

### Frontend
- React
- TailwindCSS + DaisyUI
- React Router
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- validator

### Testing
- Jest (ESM‑compatible)
- Supertest
- MongoDB Memory Server
- jest.unstable_mockModule (for middleware mocking)

---

## 📁 Project Structure

```
backend/
│── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
│── migrations/
│   └── seed.js
│
│── tests/
│   ├── integration/
│   ├── middleware/
│   ├── routes/
│   └── setup/
│       ├── setupDB.js
│       └── setupTests.js
│
│── package.json
│── jest.config.js
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/kgkaudi/EventsProject.git
cd EventsProject
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Create a `.env` file

```
MONGO_URI=mongodb://localhost:27017/KostasEvents
PORT=5001

UPSTASH_REDIS_REST_URL=https://rapid-satyr-39656.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your_token_here>

NODE_ENV=development
SECRET=<your_jwt_secret>
```

### 4️⃣ Start the backend

```bash
npm run dev
```

---

## 🔒 Authentication Flow

1. User logs in → receives JWT  
2. Client stores token (localStorage)  
3. Protected routes require `Authorization: Bearer <token>`  
4. `requireAuth` verifies token and attaches `req.user`  
5. Controllers use `req.user._id` for authorization  
6. Only event owners can update/delete their events  
7. User deletion requires password confirmation  

---

## 🧱 Database Models

### User
- name  
- email  
- password (hashed)  
- role  
- timestamps  

### Event
- title  
- content  
- location  
- maxcapacity  
- date  
- categories  
- tags  
- createdBy (user reference)  
- timestamps  

---

## 🧭 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/users/signup` | Register new user |
| POST | `/users/login` | Login user |
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get single user |
| PUT | `/users/:id` | Update user |
| PUT | `/users/change-password/:id` | Update password |
| DELETE | `/users/:id` | Delete user (requires password) |
| PUT | `/users/:id/role` | Update user role (admin only) |

### Events
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/events` | Get all events (search + pagination) |
| GET | `/events/:id` | Get event |
| GET | `/events/mine` | Get events created by logged‑in user |
| POST | `/events` | Create event (auth required) |
| PUT | `/events/:id` | Update event (owner only) |
| DELETE | `/events/:id` | Delete event (owner only) |
| GET | `/events/stats` | Admin analytics |

---

## 🧩 Future Improvements

- Image uploads for events (Cloudinary / S3)
- User profile pages with editable info
- Enhanced admin analytics (charts, insights)
- Natural language search (“next Friday”, “this weekend”)
- Advanced filters (capacity, category chips)
- Event bookmarking / favorites
- Social sharing (copy link, share to social)
- Event comments or discussion threads
- Email notifications (event reminders, updates)

---

## 🙌 Author

**Kostas**  
Full‑stack developer passionate about clean architecture, testing, and scalable MERN applications.

---