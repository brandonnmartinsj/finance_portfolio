import React from 'react';

function TransactionList({ transactions, onDelete }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="card">
      <h2>Histórico de Transações</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Ativo</th>
            <th>Ticker</th>
            <th>Quantidade</th>
            <th>Preço</th>
            <th>Total</th>
            <th>Taxas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center' }}>
                Nenhuma transação registrada
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => {
              const total = transaction.quantity * transaction.price;
              return (
                <tr key={transaction.id}>
                  <td>{formatDate(transaction.date)}</td>
                  <td>
                    <span
                      className={transaction.type === 'BUY' ? 'positive' : 'negative'}
                      style={{ fontWeight: 'bold' }}
                    >
                      {transaction.type === 'BUY' ? 'COMPRA' : 'VENDA'}
                    </span>
                  </td>
                  <td>{transaction.asset_type}</td>
                  <td><strong>{transaction.ticker}</strong></td>
                  <td>{transaction.quantity.toFixed(2)}</td>
                  <td>{formatCurrency(transaction.price)}</td>
                  <td>{formatCurrency(total)}</td>
                  <td>{formatCurrency(transaction.fees || 0)}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => onDelete(transaction.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionList;
