import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AssetDetails from './pages/AssetDetails';
import TransactionForm from './components/TransactionForm';
import Header from './components/layout/Header';

function AppContent() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

  const handleTransactionAdded = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <Header />

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
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
            }
          />
          <Route
            path="/asset/:ticker"
            element={<AssetDetails />}
          />
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
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
