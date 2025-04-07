# 🎥 Video Interaction & Subscription Backend API

This is the backend system for a video-sharing platform where users can:

- Like and comment on videos
- Subscribe to other users
- Upload videos (with Multer for file handling)
- Authenticate securely using **JWT**

Built with **Node.js**, **Express.js**, **MongoDB**, **JWT**, and **Multer**.

---

## 🚀 Features

- 🔐 **JWT-based Authentication**
- 📹 Video Upload (Multer)
- ❤️ Like / 💬 Comment functionality
- 📩 Subscription system
- 🛠 RESTful API structure

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **File Upload:** Multer
- **Authentication:** JWT (JSON Web Tokens)

---

## 📁 Project Structure

```sh
├── controllers/
├── models/
├── routes/
├── middlewares/
├── uploads/
├── config/
├── utils/
├── app.js
└── .env
```

---

## 📦 Installation

## 1. **Clone the repository**

```bash
git clone https://github.com/Abhinav-singh01/Vid-tube.git
cd video-backend
```


## Install Dependencies
```bash
npm install
```

## Run the development server

```bash
npm nodemon index.js
```

## 🔐 JWT Authentication Flow
- When a user logs in or registers, a token is generated using JWT.

- This token must be sent in the Authorization header for protected routes.


## 🧪 API Endpoints (Sample)
- POST /api/auth/register – Register new user

- POST /api/auth/login – Login and get JWT

- POST /api/videos/upload – Upload video (protected)

- GET /api/videos/:id – Get video details

- POST /api/videos/:id/like – Like a video (protected)

- POST /api/videos/:id/comment – Comment on a video (protected)

- POST /api/users/:id/subscribe – Subscribe to user (protected)

- Use tools like Postman or Swagger to test the API.