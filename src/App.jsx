import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import LabDetail from './pages/LabDetail';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// Komponen Pembatas Rute untuk memeriksa status login
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-50"><div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Komponen Pencegah Login bagi yang sudah ter-otentikasi
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-slate-50"><div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div></div>;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/lab/:id" element={<LabDetail />} />
          
          {/* Prevent authenticated users from visiting the generic login page */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          {/* Protected Dashboard Route Group */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
