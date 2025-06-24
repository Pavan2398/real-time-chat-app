# Real-Time Chat Application using MERN Stack and Socket.IO

## Abstract

This project is a full-stack real-time chat application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and integrated with Socket.IO for real-time bi-directional communication. The app supports user authentication, private messaging, group chats, typing indicators, online/offline status, and avatar customization. It features a clean UI with Tailwind CSS and provides a responsive, interactive chat experience.

---

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Implementation Steps](#key-implementation-steps)
- [Conclusion](#conclusion)

---

## Introduction

In the age of instant communication, real-time messaging applications play a crucial role. This project aims to build a secure and efficient platform where users can communicate in real-time, either one-on-one or in groups, with features such as message persistence, online status, and user authentication.

---

## Features

- User authentication (JWT)
- Private and group messaging
- Real-time updates with Socket.IO
- Typing indicators
- Online/offline status
- Avatar customization
- Responsive UI with Tailwind CSS
- Persistent chat history

---

## Tech Stack

**Frontend:**
- React.js
- Tailwind CSS

**Backend:**
- Node.js
- Express.js

**Real-Time:**
- Socket.IO

**Database:**
- MongoDB + Mongoose

**Authentication:**
- JWT (JSON Web Token)

**Others:**
- Axios
- dotenv
- bcryptjs

---

## Getting Started

### Prerequisites

- Node.js & npm
- MongoDB

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/Pavan2398/real-time-chat-app.git
   cd chatApp
   ```

2. **Install backend dependencies:**
   ```sh
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```sh
   cd frontend
   npm install
   ```

4. **Set up environment variables:**
   - Create a `.env` file in the `backend` directory with your MongoDB URI and JWT secret, for example:
     ```env
     MONGODB_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

5. **Run the backend server:**
   ```sh
   cd backend
   nodemon server.js
   ```

6. **Run the frontend app:**
   ```sh
   cd frontend
   npm run dev
   ```

---

## Project Structure

```
chatApp/
├── backend/         # Node.js/Express backend
├── frontend/        # React frontend
├── README.md
└── ...
```

---

## Key Implementation Steps

### Frontend (React + Tailwind)
- Built reusable components: `AuthForm`, `ChatArea`, `UserList`, `GroupList`
- Integrated Socket.IO client for real-time updates
- Used React state management (`useState`, `useEffect`) for chat logic and UI
- Implemented avatar assignment, typing indicators, and online status

### Backend (Node.js + Express)
- Created REST APIs for authentication (`/signup`, `/signin`) using JWT
- Defined Mongoose models for Users, Messages, and Groups
- Configured Socket.IO server for events: `send_message`, `typing`, `join_room`, etc.
- Enabled CORS and middleware for JSON handling

### Socket.IO Integration
- Established WebSocket connection between client and server
- Emitted and listened for events to broadcast messages and typing updates
- Handled room joins for group messaging
- Added typing indicators that show "User is typing…" in real time using Socket.IO events. 
- Status resets on message send or timeout. 
- Tracked user connection status via Socket.IO and reflected it visually using 
colored dots or badges (green = online, gray = offline).
### MongoDB Integration
- Stored user credentials, chat history, and group metadata
- Enabled retrieval of previous messages for persistent chat experience

---

## Conclusion

This chat application demonstrates how modern web technologies can be combined to create a powerful and interactive real-time communication platform. With scalable architecture, real-time responsiveness, and clean UI/UX, it serves as a strong foundation for more complex systems like collaborative tools, support systems, or social messaging apps.

---