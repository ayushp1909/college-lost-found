import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LostItems from './pages/LostItems';
import FoundItems from './pages/FoundItems';
import PostItem from './pages/PostItem';
import ItemDetails from './pages/ItemDetails';
import EditItem from './pages/EditItem';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/lost-items"
                element={
                  <ProtectedRoute>
                    <LostItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/found-items"
                element={
                  <ProtectedRoute>
                    <FoundItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-item"
                element={
                  <ProtectedRoute>
                    <PostItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/items/:id"
                element={
                  <ProtectedRoute>
                    <ItemDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-item/:id"
                element={
                  <ProtectedRoute>
                    <EditItem />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
