import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { ItemListing } from './components/ItemListing';
import { AddItem } from './components/AddItem';
import { EditItem } from './components/EditItem';
import { MyItems } from './components/MyItems';
import { Reservations } from './components/Reservations';
import { Messages } from './components/Messages';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { Reports } from './components/Reports';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Auth />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/items"
        element={
          <PrivateRoute>
            <ItemListing />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-item"
        element={
          <PrivateRoute>
            <AddItem />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit-item/:itemId"
        element={
          <PrivateRoute>
            <EditItem />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-items"
        element={
          <PrivateRoute>
            <MyItems />
          </PrivateRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <PrivateRoute>
            <Reservations />
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <Messages />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPanel />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Reports />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}