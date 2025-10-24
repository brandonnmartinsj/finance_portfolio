import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import { currencyService } from '../services/currencyService';
import TickerSearch from './TickerSearch';

function TransactionForm({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    type: 'BUY',
    asset_type: 'ACAO_BR',
    ticker: '',
    name: '',
    market: 'BR',
    quantity: '',
    price: '',
    currency: 'BRL',
    date: new Date().toISOString().split('T')[0],
    fees: '0',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [convertedPrice, setConvertedPrice] = useState(null);
  const [loadingRate, setLoadingRate] = useState(false);

  useEffect(() => {
    if (formData.currency === 'USD' && formData.price) {
      loadExchangeRate();
    } else {
      setExchangeRate(null);
      setConvertedPrice(null);
    }
  }, [formData.currency, formData.price]);

  const loadExchangeRate = async () => {
    try {
      setLoadingRate(true);
      const response = await currencyService.getExchangeRate('USD', 'BRL');
      setExchangeRate(response.data.rate);

      if (formData.price) {
        const converted = parseFloat(formData.price) * response.data.rate;
        setConvertedPrice(converted);
      }
    } catch (error) {
      console.error('Error loading exchange rate:', error);
      setExchangeRate(5.00);
      if (formData.price) {
        setConvertedPrice(parseFloat(formData.price) * 5.00);
      }
    } finally {
      setLoadingRate(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'asset_type') {
      if (value === 'ACAO_BR' || value === 'RENDA_FIXA') {
        setFormData(prev => ({ ...prev, market: 'BR', currency: 'BRL' }));
      } else if (value === 'ACAO_US') {
        setFormData(prev => ({ ...prev, market: 'US', ticker: '', name: '', currency: 'USD' }));
      }
    }
  };

  const handleTickerSelect = (data) => {
    setFormData(prev => ({
      ...prev,
      ticker: data.ticker,
      name: data.name || data.ticker
    }));
  };

  const handleTickerChange = (value) => {
    setFormData(prev => ({
      ...prev,
      ticker: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let ticker = formData.ticker.trim().toUpperCase();

      if (formData.asset_type === 'ACAO_BR' && !ticker.endsWith('.SA')) {
        ticker = `${ticker}.SA`;
      }

      if (formData.asset_type === 'ACAO_US' && ticker.endsWith('.SA')) {
        ticker = ticker.replace('.SA', '');
      }

      const data = {
        ...formData,
        ticker,
        quantity: parseFloat(formData.quantity),
        price: parseFloat(formData.price),
        fees: parseFloat(formData.fees || 0)
      };

      await transactionService.create(data);
      onSuccess();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Erro ao criar transação');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Nova Transação</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipo de Transação</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="BUY">Compra</option>
              <option value="SELL">Venda</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo de Ativo</label>
            <select
              name="asset_type"
              value={formData.asset_type}
              onChange={handleChange}
              required
            >
              <option value="ACAO_BR">Ação Brasileira</option>
              <option value="ACAO_US">Ação Americana</option>
              <option value="RENDA_FIXA">Renda Fixa</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Ticker
              {formData.asset_type === 'ACAO_US' && (
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                  (Digite para buscar)
                </span>
              )}
            </label>
            {formData.asset_type === 'ACAO_US' ? (
              <TickerSearch
                value={formData.ticker}
                onChange={handleTickerChange}
                onSelect={handleTickerSelect}
                assetType={formData.asset_type}
                placeholder="Ex: AAPL, MSFT, GOOGL..."
              />
            ) : (
              <input
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleChange}
                placeholder="Ex: PETR4.SA, IPCA-2035"
                required
              />
            )}
          </div>

          <div className="form-group">
            <label>
              Nome do Ativo
              {formData.asset_type === 'ACAO_US' && formData.name && (
                <span style={{ fontSize: '12px', color: '#16a34a', marginLeft: '8px' }}>
                  ✓ Auto-preenchido
                </span>
              )}
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={formData.asset_type === 'ACAO_US' ? 'Será preenchido automaticamente' : 'Ex: Petrobras PN'}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantidade</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label>Moeda</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
            >
              <option value="BRL">BRL (Real Brasileiro)</option>
              <option value="USD">USD (Dólar Americano)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Preço {formData.currency === 'USD' && '(em Dólar)'}</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
            {formData.currency === 'USD' && exchangeRate && formData.price && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <div style={{ color: '#1e40af', marginBottom: '4px' }}>
                  <strong>Cotação atual:</strong> {formatCurrency(exchangeRate, 'BRL')}/USD
                  {loadingRate && ' (carregando...)'}
                </div>
                <div style={{ color: '#16a34a', fontWeight: '600' }}>
                  <strong>Valor em Reais:</strong> {formatCurrency(convertedPrice || 0, 'BRL')}
                </div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                  A transação será salva em BRL usando a cotação atual
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Taxas (opcional)</label>
            <input
              type="number"
              name="fees"
              value={formData.fees}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label>Observações (opcional)</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
