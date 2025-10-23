import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Header() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1>Portfolio de Investimentos</h1>
            </Link>
            <p>Gerencie seus investimentos em ações e renda fixa</p>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
              style={{
                textDecoration: 'none',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: location.pathname === '/' ? '#eff6ff' : 'transparent',
                color: location.pathname === '/' ? '#1e40af' : '#4b5563'
              }}
            >
              Dashboard
            </Link>

            <Link
              to="/analytics"
              className={location.pathname === '/analytics' ? 'nav-link active' : 'nav-link'}
              style={{
                textDecoration: 'none',
                fontWeight: location.pathname === '/analytics' ? 'bold' : 'normal',
                padding: '8px 16px',
                borderRadius: '6px',
                backgroundColor: location.pathname === '/analytics' ? '#eff6ff' : 'transparent',
                color: location.pathname === '/analytics' ? '#1e40af' : '#4b5563'
              }}
            >
              Análises
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '14px' }}>Olá, {user?.name}</span>
              <button
                onClick={logout}
                className="btn"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Sair
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
