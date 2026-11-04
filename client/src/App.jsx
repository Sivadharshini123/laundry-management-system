import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import LaundryDetail from './pages/LaundryDetail';
import MachineSlots from './pages/MachineSlots';
import Transactions from './pages/Transactions';
import ChatAssistant from './pages/ChatAssistant';
import StaffDashboard from './pages/StaffDashboard';

function ProtectedRoute({ children, staffOnly = false }) {
  const { isAuthenticated, isStaff, loading } = useAuth();

  if (loading) {
    return <div className="p-12 text-center text-sm text-slate-400">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (staffOnly && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/laundry/:id" element={<LaundryDetail />} />
                  <Route path="/machine/:id/slots" element={<MachineSlots />} />
                  
                  {/* Protected Student Routes */}
                  <Route
                    path="/transactions"
                    element={
                      <ProtectedRoute>
                        <Transactions />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatAssistant />
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected Staff Dashboard (Server & Route Enforced) */}
                  <Route
                    path="/staff"
                    element={
                      <ProtectedRoute staffOnly>
                        <StaffDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
