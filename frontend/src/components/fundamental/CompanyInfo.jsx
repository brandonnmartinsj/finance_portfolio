import React from 'react';

function CompanyInfo({ companyInfo }) {
  if (!companyInfo) {
    return (
      <div className="card">
        <h2>Informações da Empresa</h2>
        <p style={{ color: '#666' }}>Informações não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Sobre a Empresa</h2>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>{companyInfo.name}</h3>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <div>
            <strong>Setor:</strong> <span style={{ color: '#0066cc' }}>{companyInfo.sector}</span>
          </div>
          <div>
            <strong>Indústria:</strong> <span style={{ color: '#0066cc' }}>{companyInfo.industry}</span>
          </div>
          {companyInfo.employees > 0 && (
            <div>
              <strong>Funcionários:</strong> {companyInfo.employees.toLocaleString('pt-BR')}
            </div>
          )}
        </div>
      </div>

      {companyInfo.description && (
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px', fontWeight: 'bold' }}>
            Descrição do Negócio
          </h4>
          <p style={{ lineHeight: '1.6', color: '#444', textAlign: 'justify' }}>
            {companyInfo.description}
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
        {companyInfo.website && (
          <div>
            <strong style={{ fontSize: '13px' }}>Website:</strong>
            <br />
            <a
              href={companyInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0066cc', textDecoration: 'none', fontSize: '13px' }}
            >
              {companyInfo.website}
            </a>
          </div>
        )}

        {companyInfo.address && (
          <div>
            <strong style={{ fontSize: '13px' }}>Endereço:</strong>
            <br />
            <span style={{ fontSize: '13px', color: '#666' }}>
              {companyInfo.address}
              {companyInfo.city && `, ${companyInfo.city}`}
              {companyInfo.state && ` - ${companyInfo.state}`}
              {companyInfo.country && `, ${companyInfo.country}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyInfo;
