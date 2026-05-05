import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewService from './pages/NewService';
import { seedInitialData } from './services/seeder';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin"></div>
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

      <Route path="/servicos/novo" element={
        <PrivateRoute>
          <NewService />
        </PrivateRoute>
      } />

      {/* Placeholder for other routes requested by user */}
      <Route path="/servicos" element={
        <PrivateRoute>
          <div className="card text-center py-20">
            <h2 className="text-2xl font-black mb-4">Lista de Serviços</h2>
            <p className="text-gray-500">Módulo em desenvolvimento para consulta completa offline.</p>
          </div>
        </PrivateRoute>
      } />

      <Route path="/financeiro" element={
        <PrivateRoute>
          <div className="card text-center py-20">
            <h2 className="text-2xl font-black mb-4">Financeiro Profissional</h2>
            <p className="text-gray-500">Fluxo de caixa, comissões e DRE agrícola.</p>
          </div>
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
