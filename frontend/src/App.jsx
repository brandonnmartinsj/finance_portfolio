import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Dashboard from './pages/Dashboard';
import DashboardNew from './pages/DashboardNew';
import AssetDetails from './pages/AssetDetails';
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Register from './pages/Register';
import TransactionForm from './components/TransactionForm';
import ImportTransactions from './components/ImportTransactions';
import Header from './components/layout/Header';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setShowForm(false);
    setShowImport(false);
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
                  <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                    <button
                      className="btn btn-primary"
                      onClick={() => setShowForm(true)}
                    >
                      + Nova Transação
                    </button>
                    <button
                      className="btn"
                      onClick={() => setShowImport(true)}
                      style={{
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      📤 Importar PDF/CSV
                    </button>
                  </div>
                  <Dashboard key={refreshKey} />
                </>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardNew />
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
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <Goals />
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

        {showImport && (
          <ImportTransactions
            onClose={() => setShowImport(false)}
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
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
