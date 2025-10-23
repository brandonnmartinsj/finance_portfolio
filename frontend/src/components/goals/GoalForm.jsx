import React, { useState, useEffect } from 'react';

const GOAL_TYPES = [
  { value: 'TOTAL_PORTFOLIO', label: 'Patrimônio Total' },
  { value: 'MONTHLY_DIVIDENDS', label: 'Dividendos Mensais' },
  { value: 'YEARLY_DIVIDENDS', label: 'Dividendos Anuais' },
  { value: 'ASSET_QUANTITY', label: 'Quantidade de Ativos' },
  { value: 'CUSTOM', label: 'Personalizada' }
];

const GoalForm = ({ goal, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'TOTAL_PORTFOLIO',
    target_amount: '',
    current_amount: '',
    target_date: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'TOTAL_PORTFOLIO',
        target_amount: goal.target_amount || '',
        current_amount: goal.current_amount || '',
        target_date: goal.target_date || '',
        status: goal.status || 'active'
      });
    }
  }, [goal]);

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.target_amount || formData.target_amount <= 0) {
      newErrors.target_amount = 'Meta deve ser maior que zero';
    }

    if (formData.current_amount < 0) {
      newErrors.current_amount = 'Valor atual não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const dataToSubmit = {
      ...formData,
      target_amount: parseFloat(formData.target_amount),
      current_amount: parseFloat(formData.current_amount) || 0
    };

    onSubmit(dataToSubmit);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
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
      onClick={onCancel}
    >
      <div
        className="card"
        style={{
          maxWidth: '600px',
          width: '90%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginBottom: '20px' }}>
          {goal ? 'Editar Meta' : 'Nova Meta'}
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Título *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Alcançar R$ 100.000 em patrimônio"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.title ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {errors.title && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                {errors.title}
              </div>
            )}
          </div>

          {/* Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Tipo de Meta *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              {GOAL_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva sua meta..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Target Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Valor da Meta (R$) *
            </label>
            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              placeholder="100000"
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.target_amount ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {errors.target_amount && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                {errors.target_amount}
              </div>
            )}
          </div>

          {/* Current Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Valor Atual (R$)
            </label>
            <input
              type="number"
              name="current_amount"
              value={formData.current_amount}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              style={{
                width: '100%',
                padding: '10px',
                border: errors.current_amount ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            {errors.current_amount && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                {errors.current_amount}
              </div>
            )}
          </div>

          {/* Target Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
              Prazo (opcional)
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Status */}
          {goal && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="active">Ativa</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {goal ? 'Atualizar' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalForm;
