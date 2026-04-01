# 📌 Events Management Platform (MERN Stack)

A full‑stack **Events Management Platform** built with the **MERN** stack.  
Users can register, log in, create events, update them, delete them, and browse events created by others.  
The platform includes **JWT authentication**, **owner‑only permissions**, **password‑protected user deletion**, and a fully tested backend using **Jest**, **Supertest**, and **MongoDB Memory Server**.

The frontend is built with **React + Tailwind + DaisyUI**, featuring a clean UI, modals, password toggles, and a smooth user experience.

---

## 🚀 Features

### 👤 User Management
- User registration (signup)
- Secure login with JWT
- Strong password validation
- Update user profile
- Change password
- Delete user (requires password confirmation)
- Fetch all users / single user
- Role support (user / admin)

### 🎉 Event Management
- Create event
- Update event (owner‑only)
- Delete event (owner‑only)
- Fetch all events
- Fetch single event
- Events linked to the user who created them

### 🔐 Authentication & Security
- JWT‑based authentication
- `requireAuth` middleware
- Protected routes
- Owner‑only edit/delete enforcement
- Password hashing with bcrypt
- Input validation

### 🖥️ Frontend Features
- React + React Router
- TailwindCSS + DaisyUI
- Clean, modern UI
- Event cards with metadata
- Owner‑only edit/delete buttons
- Delete confirmation modal with password input
- Toggle password visibility (eye/eye‑off)
- Toast notifications for all actions

### 🧪 Testing (Full Coverage)
- **Integration tests** for controllers using:
  - Supertest
  - MongoDB Memory Server
- **Unit tests** for:
  - Routes
  - Middleware
- Clean separation between test layers
- Mocked authentication for route tests
- Real DB logic for integration tests

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
UPSTASH_REDIS_REST_TOKEN = <your_token_here>

NODE_ENV = development

SECRET = <your_jwt_secret>
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
| **Controllers** | Jest + Supertest + Mongo Memory Server | Full integration tests with real DB logic |

---

## 🔒 Authentication Flow

1. User logs in → receives JWT  
2. Client stores token (localStorage)  
3. Protected routes require `Authorization: Bearer <token>`  
4. `requireAuth` verifies token and attaches `req.user`  
5. Controllers use `req.user._id` to authorize actions  
6. Only event owners can update/delete their events  
7. User deletion requires password confirmation  

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
| PUT | `/users/change-password/:id` | Update password |
| DELETE | `/users/:id` | Delete user (requires password) |

### Events
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/:id` | Get event |
| POST | `/events` | Create event (auth required) |
| PUT | `/events/:id` | Update event (owner only) |
| DELETE | `/events/:id` | Delete event (owner only) |

---

## 🧩 Future Improvements

- Event search (title, location)
- Pagination & infinite scroll
- Image uploads for events
- User profile pages
- Admin dashboard
- Event categories & tags (optional future feature)

---

## 🙌 Author

**Kostas**  
Full‑stack developer passionate about clean architecture, testing, and scalable MERN applications.

---