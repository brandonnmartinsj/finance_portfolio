import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import TransactionForm from './components/TransactionForm';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTransactionAdded = () => {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div>
      <header className="header">
        <div className="container">
          <h1>Portfolio de Investimentos</h1>
          <p>Gerencie seus investimentos em ações e renda fixa</p>
        </div>
      </header>

      <div className="container">
        <div style={{ marginBottom: '20px' }}>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Nova Transação
          </button>
        </div>

        <Dashboard key={refreshKey} />

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

export default App;
