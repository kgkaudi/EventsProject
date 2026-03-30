# 📌 Events Management Platform (MERN Stack)

A full‑stack **Events Management Platform** built with the **MERN** stack.  
Users can register, log in, create events, update them, delete them, and browse events created by others.  
The backend includes **JWT authentication**, **role‑based logic**, **MongoDB models**, and a fully tested API using **Jest**, **Supertest**, and **MongoDB Memory Server**.

This project demonstrates clean architecture, modular controllers, reusable middleware, and production‑grade testing.

---

## 🚀 Features

### 👤 User Management
- User registration (signup)
- Secure login with JWT
- Password hashing with bcrypt
- Strong password validation
- Update user profile
- Update password
- Delete user
- Fetch all users / single user

### 🎉 Event Management
- Create event
- Update event
- Delete event
- Fetch all events
- Fetch single event
- Events linked to the user who created them

### 🔐 Authentication & Security
- JWT‑based authentication
- `requireAuth` middleware
- Protected event routes
- Secure password hashing
- Input validation

### 🧪 Testing (Full Coverage)
- **Unit tests** for routes & middleware  
- **Integration tests** for controllers using:
  - `supertest`
  - `mongodb-memory-server`
  - `jest`
- Clean separation between unit and integration layers

---

## 🏗️ Tech Stack

### Frontend
- React
- Material UI
- React Router
- Axios

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
│   ├── controllers/
│   │   ├── usersController.js
│   │   └── eventsController.js
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Event.js
│   ├── routes/
│   │   ├── usersRoutes.js
│   │   └── eventsRoutes.js
│   └── server.js
│
│── tests/
│   ├── integration/
│   │   ├── usersController.int.test.js
│   │   └── eventsController.int.test.js
│   ├── middleware/
│   │   └── requireAuth.test.js
│   └── routes/
│       ├── usersRoutes.test.js
│       └── eventsRoutes.test.js
│
│── package.json
│── jest.config.js
│── README.md
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
MONGO_URI = mongodb://localhost:27017/KostasEvents
PORT = 5001

UPSTASH_REDIS_REST_URL = https://rapid-satyr-39656.upstash.io
UPSTASH_REDIS_REST_TOKEN = AZroAAIncDIzNmMzYTMyNjc1NDA0NmQ5YWQyZmFjMmRkN2I1ZWI1NHAyMzk2NTY

NODE_ENV = development

SECRET=2HDqw3PAWSXCZMfVuMDMjJRwMiA3clWV4yc1oZ4cYIv

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

### Run tests in watch mode

```bash
npm run test:watch
```

### What is tested?

| Layer | Tools | Description |
|-------|--------|-------------|
| **Routes** | Jest + Supertest | Ensures endpoints call correct controllers |
| **Middleware** | Jest | Mocks JWT + DB calls |
| **Controllers** | Jest + Supertest + MongoDB Memory Server | Full integration tests with real DB logic |

---

## 🔒 Authentication Flow

1. User logs in → receives JWT  
2. Client stores token (localStorage)  
3. Protected routes require `Authorization: Bearer <token>`  
4. `requireAuth` verifies token and attaches `req.user`  
5. Controllers use `req.user._id` to authorize actions  

---

## 🧱 Database Models

### User Model
- name  
- email  
- password (hashed)  
- role  
- timestamps  

### Event Model
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
| PUT | `/users/:id/password` | Update password |
| DELETE | `/users/:id` | Delete user |

### Events
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/:id` | Get event |
| POST | `/events` | Create event (auth required) |
| PUT | `/events/:id` | Update event |
| DELETE | `/events/:id` | Delete event |

---

## 🧩 Future Improvements

- Event categories & tags  
- User roles (admin, organizer, attendee)  
- Email notifications  
- Pagination & search  
- Image uploads for events  

---

## 🙌 Author

**Kostas**  
Full‑stack developer passionate about clean architecture, testing, and scalable MERN applications.

---