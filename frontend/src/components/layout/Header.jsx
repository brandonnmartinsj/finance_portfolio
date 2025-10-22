import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

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

          <nav>
            <Link
              to="/"
              className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
              style={{
                marginLeft: '20px',
                textDecoration: 'none',
                fontWeight: location.pathname === '/' ? 'bold' : 'normal'
              }}
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
