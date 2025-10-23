import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

function DividendHistory({ dividends, yearlyTotals, currency = 'BRL', source = 'brapi' }) {
  if (!dividends || dividends.length === 0) {
    return (
      <div className="card">
        <h2>Histórico de Dividendos</h2>
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          Nenhum dividendo registrado para este ativo
        </p>
      </div>
    );
  }

  const parseDateString = (dateStr) => {
    if (!dateStr) return new Date(0);
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const sortedDividends = [...dividends].sort((a, b) => {
    const dateA = parseDateString(a.date || a.paymentDate);
    const dateB = parseDateString(b.date || b.paymentDate);
    return dateB - dateA;
  });

  const totalDividends = dividends.reduce((sum, div) => sum + (div.rate || div.value || 0), 0);

  return (
    <div className="card">
      <h2>Histórico de Dividendos</h2>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '5px' }}>
              Total de Dividendos (histórico disponível)
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              {formatCurrency(totalDividends, currency)}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '5px' }}>
              Pagamentos Registrados
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#15803d' }}>
              {dividends.length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Data de Pagamento</th>
              <th>Tipo</th>
              <th style={{ textAlign: 'right' }}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {sortedDividends.slice(0, 20).map((dividend, index) => {
              const date = dividend.date || dividend.paymentDate;
              const value = dividend.rate || dividend.value || 0;
              const type = dividend.type || 'DIVIDENDO';
              const displayDate = date.includes && date.includes('/') ? date : formatDate(date);

              return (
                <tr key={index}>
                  <td>{displayDate}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        backgroundColor: type === 'JCP' ? '#dbeafe' : '#fef3c7',
                        color: type === 'JCP' ? '#1e40af' : '#92400e'
                      }}
                    >
                      {type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>
                    {formatCurrency(value, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dividends.length > 20 && (
        <p style={{ textAlign: 'center', color: '#666', fontSize: '13px', marginTop: '10px' }}>
          Mostrando os 20 pagamentos mais recentes de {dividends.length} total
        </p>
      )}

      {yearlyTotals && yearlyTotals.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Totais por Ano</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Ano</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {yearlyTotals.map((yt) => (
                  <tr key={yt.year}>
                    <td>{yt.year}</td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#15803d' }}>
                      {formatCurrency(yt.total, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#1e40af' }}>
          💡 Sobre Dividendos
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#1e40af', lineHeight: '1.8' }}>
          <li><strong>Dividendo:</strong> Parte do lucro distribuído aos acionistas</li>
          <li><strong>JCP:</strong> Juros sobre Capital Próprio (tem retenção de IR na fonte)</li>
          <li><strong>Dividend Yield:</strong> Dividendos anuais divididos pelo preço da ação</li>
        </ul>
        {source === 'fundamentus' && (
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#1e40af', fontStyle: 'italic' }}>
            Fonte: Fundamentus.com.br
          </p>
        )}
      </div>
    </div>
  );
}

export default DividendHistory;
