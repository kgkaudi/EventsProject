# 📌 Events Management Platform — MERN Stack

A full‑stack **Events Management Platform** built with the **MERN** stack.  
Users can register, authenticate, create events, update them, delete them, and browse events created by others.  
The backend includes **JWT authentication**, **role‑based access**, **owner‑only permissions**, and a fully tested API using **Jest**, **Supertest**, and **MongoDB Memory Server**.

The frontend is built with **React + TailwindCSS + DaisyUI**, offering a clean UI, modals, password toggles, and a smooth user experience.

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
- Fetch all events
- Fetch single event
- Fetch events created by the logged‑in user
- Events linked to the user who created them

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

---

## 🧪 Testing (Full Coverage)

### Integration Tests
- Controllers tested with:
  - Supertest
  - MongoDB Memory Server
  - Real DB logic (no mocks)

### Unit Tests
- Routes (mock controllers)
- Middleware (mock JWT + DB)

### Test Layers

| Layer | Tools | Description |
|-------|--------|-------------|
| **Routes** | Jest + Supertest | Ensures endpoints call correct controllers |
| **Middleware** | Jest | Mocks JWT + DB calls |
| **Controllers** | Jest + Supertest + Mongo Memory Server | Full integration tests with real DB logic |

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
- Jest
- Supertest
- MongoDB Memory Server

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
│── tests/
│   ├── integration/
│   ├── middleware/
│   ├── routes/
│   └── setup/
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

## 🧪 Running Tests

### Run all tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
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
| GET | `/events` | Get all events |
| GET | `/events/:id` | Get event |
| GET | `/events/mine` | Get events created by logged‑in user |
| POST | `/events` | Create event (auth required) |
| PUT | `/events/:id` | Update event (owner only) |
| DELETE | `/events/:id` | Delete event (owner only) |
| GET | `/events/stats` | Admin analytics |

---

## 🧩 Future Improvements

- Event search (title, location)
- Pagination & infinite scroll
- Image uploads
- User profile pages
- Enhanced admin analytics
- Event categories & tags

---

## 🙌 Author

**Kostas**  
Full‑stack developer passionate about clean architecture, testing, and scalable MERN applications.

---