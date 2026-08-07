import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import StoreList from './pages/user/StoreList';
import UserChangePassword from './pages/user/ChangePassword';
import StoreOwnerDashboard from './pages/storeOwner/Dashboard';
import StoreOwnerChangePassword from './pages/storeOwner/ChangePassword';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container"><p>Loading...</p></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'normal') return <Navigate to="/stores" replace />;
  if (user.role === 'store_owner') return <Navigate to="/store-owner/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '20px', paddingBottom: '40px' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/add"
            element={
              <ProtectedRoute roles={['admin']}>
                <AddUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores"
            element={
              <ProtectedRoute roles={['admin']}>
                <AdminStores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/stores/add"
            element={
              <ProtectedRoute roles={['admin']}>
                <AddStore />
              </ProtectedRoute>
            }
          />

          <Route
            path="/stores"
            element={
              <ProtectedRoute roles={['normal']}>
                <StoreList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/change-password"
            element={
              <ProtectedRoute roles={['normal', 'store_owner']}>
                <RoleBasedChangePassword />
              </ProtectedRoute>
            }
          />

          <Route
            path="/store-owner/dashboard"
            element={
              <ProtectedRoute roles={['store_owner']}>
                <StoreOwnerDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<RoleRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function RoleBasedChangePassword() {
  const { user } = useAuth();
  if (user?.role === 'store_owner') return <StoreOwnerChangePassword />;
  return <UserChangePassword />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
