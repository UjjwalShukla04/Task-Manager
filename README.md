# Collaborative Task Manager

A real-time collaborative task management application built with the PERN stack (PostgreSQL, Express, React, Node.js).

## Features

- **User Authentication**: Secure JWT-based authentication with HttpOnly cookies.
- **Task Management**: Create, update, delete, and view tasks.
- **Real-time Collaboration**: Live updates for task creation, assignment, and status changes using Socket.io.
- **Dashboard**: Filter tasks by status and priority, sort by due date.
- **Task Assignment**: Assign tasks to other registered users.
- **Overdue Highlighting**: Visual indicators for overdue tasks.
- **Responsive UI**: Built with Tailwind CSS for mobile and desktop.

## Tech Stack

### Frontend
- **Framework**: React (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Real-time**: Socket.io Client
- **Routing**: React Router DOM
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Real-time**: Socket.io
- **Validation**: Zod
- **Testing**: Jest

## Architecture

The application follows a **Service-Repository-Controller** pattern to separate concerns:
- **Controllers**: Handle HTTP requests and responses.
- **Services**: Contain business logic and handle real-time notifications.
- **Repositories**: Handle database interactions using Prisma.
- **DTOs**: Define data shapes and validation schemas using Zod.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (Local or Cloud like Railway/Neon)

## Setup & Installation

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://user:password@localhost:5432/taskmanager"
   JWT_SECRET="your_jwt_secret"
   CLIENT_URL="http://localhost:5173"
   NODE_ENV="development"
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional if using defaults):
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Backend (Render/Railway)
1. **Build Command**: `npm run build`
2. **Start Command**: `npm start`
3. **Environment Variables**: Set `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (your frontend domain).

### Frontend (Vercel/Netlify)
1. **Build Command**: `npm run build`
2. **Output Directory**: `dist`
3. **Environment Variables**: Set `VITE_API_URL` to your deployed backend URL.

## API Documentation

### Auth
- `POST /api/auth/register`: Register a new user.
- `POST /api/auth/login`: Login user.
- `POST /api/auth/logout`: Logout user.
- `GET /api/auth/me`: Get current user profile.
- `GET /api/auth/users`: Get all users (for assignment).

### Tasks
- `POST /api/tasks`: Create a task.
- `GET /api/tasks`: Get tasks (supports filters: status, priority, sortBy).
- `PATCH /api/tasks/:id`: Update a task.
- `DELETE /api/tasks/:id`: Delete a task.

## Socket.io Events

- `join_dashboard`: Client joins their personal room (user ID).
- `task_created`: Notification when a task is created/assigned.
- `task_updated`: Notification when a task is updated.
- `task_assigned`: Notification when a task is assigned to the user.
- `task_deleted`: Notification when a task is deleted.

## Trade-offs & Decisions

1. **HttpOnly Cookies**: Chosen for better security against XSS compared to localStorage, but requires careful CORS configuration.
2. **Prisma**: Type-safe database access, though version compatibility (v7 vs v5) required sticking to v5 for stability in this setup.
3. **Socket.io**: Selected for ease of use with Rooms support for targeted notifications.
4. **Tailwind CSS**: Utility-first approach for rapid UI development.

