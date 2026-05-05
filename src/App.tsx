import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewService from './pages/NewService';
import Clientes from './pages/Clientes';
import Servicos from './pages/Servicos';
import Financeiro from './pages/Financeiro';
import { seedInitialData } from './services/seeder';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1a0f]">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-3xl animate-spin shadow-2xl"></div>
        <p className="text-primary-500 font-black uppercase tracking-[0.3em] text-xs">ROSSIAGRO</p>
      </div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" />;
  
  return <Layout>{children}</Layout>;
}

function AppContent() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      seedInitialData().catch(console.error);
    }
  }, [user]);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      <Route path="/" element={
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      } />

      <Route path="/novo-servico" element={
        <PrivateRoute>
          <NewService />
        </PrivateRoute>
      } />

      <Route path="/servicos" element={
        <PrivateRoute>
          <Servicos />
        </PrivateRoute>
      } />

      <Route path="/clientes" element={
        <PrivateRoute>
          <Clientes />
        </PrivateRoute>
      } />

      <Route path="/financeiro" element={
        <PrivateRoute>
          <Financeiro />
        </PrivateRoute>
      } />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
