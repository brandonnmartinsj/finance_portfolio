import React from 'react';
import { Link } from 'react-router-dom';

function Breadcrumb({ items }) {
  return (
    <nav style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
      {items.map((item, index) => (
        <span key={index}>
          {index > 0 && <span style={{ margin: '0 8px' }}>{'>'}</span>}
          {item.path ? (
            <Link
              to={item.path}
              style={{
                textDecoration: 'none',
                color: '#0066cc',
                fontWeight: index === items.length - 1 ? 'bold' : 'normal'
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default Breadcrumb;
