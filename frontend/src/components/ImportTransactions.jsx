import React, { useState } from 'react';
import axios from 'axios';

const ImportTransactions = ({ onSuccess, onClose }) => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('pdf');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(null);
      setError(null);

      const extension = selectedFile.name.split('.').pop().toLowerCase();
      setFileType(extension === 'csv' ? 'csv' : 'pdf');
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError('Selecione um arquivo');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = fileType === 'csv'
        ? '/api/import/csv/parse'
        : '/api/import/pdf/parse';

      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3001${endpoint}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      setPreview(response.data);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError(err.response?.data?.error || 'Erro ao processar arquivo');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!preview || !preview.transactions) {
      return;
    }

    if (preview.validation && !preview.validation.isValid) {
      setError('Corrija os erros antes de importar');
      return;
    }

    try {
      setImporting(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/import/transactions',
        { transactions: preview.transactions },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      alert(`${response.data.imported.count} transações importadas com sucesso!`);
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    } catch (err) {
      console.error('Error importing transactions:', err);
      setError(err.response?.data?.error || 'Erro ao importar transações');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: '800px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px' }}>Importar Transações</h2>

        {/* File Upload */}
        {!preview && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                Selecione o arquivo (PDF ou CSV)
              </label>
              <input
                type="file"
                accept=".pdf,.csv"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px'
                }}
              />
              {file && (
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                  📄 {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                color: '#dc2626',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleParse}
                disabled={!file || loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: (!file || loading) ? '#e5e7eb' : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (!file || loading) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processando...' : 'Processar Arquivo'}
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div>
            {/* Summary */}
            <div style={{
              padding: '15px',
              backgroundColor: '#eff6ff',
              borderRadius: '6px',
              marginBottom: '20px'
            }}>
              <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Resumo</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>Total</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{preview.summary.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#16a34a' }}>Compras</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a' }}>
                    {preview.summary.buys}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#dc2626' }}>Vendas</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                    {preview.summary.sells}
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {preview.validation && preview.validation.errors && preview.validation.errors.length > 0 && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#dc2626', marginBottom: '8px' }}>Erros encontrados:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#dc2626' }}>
                  {preview.validation.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Warnings */}
            {preview.validation && preview.validation.warnings && preview.validation.warnings.length > 0 && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                marginBottom: '20px'
              }}>
                <h4 style={{ color: '#d97706', marginBottom: '8px' }}>Avisos:</h4>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#d97706' }}>
                  {preview.validation.warnings.map((warn, i) => (
                    <li key={i}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transactions Table */}
            <div style={{ marginBottom: '20px', maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Data</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Ativo</th>
                    <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>Tipo</th>
                    <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Qtd</th>
                    <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Preço</th>
                    <th style={{ padding: '8px', textAlign: 'right', borderBottom: '2px solid #e5e7eb' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.transactions.map((tx, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '8px' }}>{new Date(tx.date).toLocaleDateString('pt-BR')}</td>
                      <td style={{ padding: '8px', fontWeight: '600' }}>{tx.ticker}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: tx.type === 'BUY' ? '#dcfce7' : '#fee2e2',
                          color: tx.type === 'BUY' ? '#166534' : '#991b1b'
                        }}>
                          {tx.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                        </span>
                      </td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{tx.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>R$ {tx.price.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: '600' }}>
                        R$ {(tx.quantity * tx.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                borderRadius: '6px',
                color: '#dc2626',
                marginBottom: '20px'
              }}>
                {error}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreview(null)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={importing || (preview.validation && !preview.validation.isValid)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: (importing || (preview.validation && !preview.validation.isValid)) ? '#e5e7eb' : '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (importing || (preview.validation && !preview.validation.isValid)) ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {importing ? 'Importando...' : `Importar ${preview.transactions.length} Transações`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportTransactions;
