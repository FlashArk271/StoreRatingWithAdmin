import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AdminUserDetail from './pages/admin/UserDetail';

// User Pages
import UserStores from './pages/user/Stores';
import UserPassword from './pages/user/Password';

// Store Owner Pages
import OwnerDashboard from './pages/owner/Dashboard';
import OwnerPassword from './pages/owner/Password';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
};

// Public Route (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'store_owner') return <Navigate to="/owner/dashboard" replace />;
    return <Navigate to="/stores" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
      } />
      <Route path="/admin/stores" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminStores /></ProtectedRoute>
      } />
      <Route path="/admin/users/:id" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminUserDetail /></ProtectedRoute>
      } />

      {/* Normal User Routes */}
      <Route path="/stores" element={
        <ProtectedRoute allowedRoles={['user']}><UserStores /></ProtectedRoute>
      } />
      <Route path="/password" element={
        <ProtectedRoute allowedRoles={['user']}><UserPassword /></ProtectedRoute>
      } />

      {/* Store Owner Routes */}
      <Route path="/owner/dashboard" element={
        <ProtectedRoute allowedRoles={['store_owner']}><OwnerDashboard /></ProtectedRoute>
      } />
      <Route path="/owner/password" element={
        <ProtectedRoute allowedRoles={['store_owner']}><OwnerPassword /></ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
