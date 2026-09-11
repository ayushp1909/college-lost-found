# College Lost & Found System

## Project Name
**AI-Powered Lost & Found System for College Campus**

## Purpose
An automated campus lost-and-found portal designed to help students and staff report, search, and reclaim lost items across college premises efficiently.

## Current Phase
**Phase 4 — Frontend Core Integration**
In this phase, a responsive, full-featured React single-page application (SPA) is connected to the backend APIs:
- Client-side routing with `react-router-dom` and route protection (`ProtectedRoute`).
- Global authentication management using React Context (`AuthContext`) with persistent `localStorage` session handling.
- Register & Login pages with client validation and backend error messaging.
- Conditional Navbar reflecting user session status.
- Lost Items and Found Items pages utilizing reusable `ItemCard` components.
- Post Item and Edit Item forms for item creation and updates.
- Item Details page with ownership-protected Edit and Delete controls.
- Personal Dashboard providing item count metrics, My Lost Items, and My Found Items.
- Clean CSS design with loading states, empty states, and feedback alerts (no Tailwind).

---

## Required Environment Variables

Create or update the file named `.env` inside the `server/` directory (refer to `server/.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/college_lost_found
JWT_SECRET=your_jwt_secret_key
```

- `PORT`: The port on which the Express backend server listens (default: `5000`).
- `MONGO_URI`: Your MongoDB connection URI (e.g., local MongoDB or MongoDB Atlas URI).
- `JWT_SECRET`: Secret key used for signing and verifying JWT tokens.

> **Note:** Never commit `.env` containing sensitive credentials to Git.

---

## Installation

You can install dependencies for both frontend and backend using the root helper script or individually.

### Option A: Install All from Root
```bash
npm run install:all
```

### Option B: Install Individually
1. **Backend:**
   ```bash
   cd server
   npm install
   ```

2. **Frontend:**
   ```bash
   cd client
   npm install
   ```

---

## Running the Application

### 1. Run Backend Server
In the `server` directory (or from root via `npm run server`):
```bash
cd server
npm run dev
```
The backend server will start on `http://localhost:5000`.

### 2. Run Frontend Client
In the `client` directory (or from root via `npm run client`):
```bash
cd client
npm run dev
```
The Vite development server will start on `http://localhost:5173`. Open this URL in your web browser.

---

## Frontend Routes

| Path | Access | Description |
|---|---|---|
| `/` | Public | Landing page with platform overview and quick links |
| `/login` | Public | User login form |
| `/register` | Public | User registration form |
| `/lost-items` | Protected | Grid of items reported lost on campus |
| `/found-items` | Protected | Grid of items found on campus |
| `/post-item` | Protected | Form to post a new lost or found item |
| `/items/:id` | Protected | Detailed item view with owner action buttons |
| `/edit-item/:id` | Protected | Edit form for updating item details (owner only) |
| `/dashboard` | Protected | User dashboard showing activity counts & personal items |
