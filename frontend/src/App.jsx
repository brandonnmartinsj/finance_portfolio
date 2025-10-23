import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import AssetDetails from './pages/AssetDetails';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionForm from './components/TransactionForm';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <Header />

      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowForm(true)}
                    >
                      + Nova Transação
                    </button>
                  </div>
                  <Dashboard key={refreshKey} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/asset/:ticker"
            element={
              <ProtectedRoute>
                <AssetDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {showForm && (
          <TransactionForm
            onClose={() => setShowForm(false)}
            onSuccess={handleTransactionAdded}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
