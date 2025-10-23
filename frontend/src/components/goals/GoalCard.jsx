import React from 'react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GOAL_TYPES = {
  'TOTAL_PORTFOLIO': 'Patrimônio Total',
  'MONTHLY_DIVIDENDS': 'Dividendos Mensais',
  'YEARLY_DIVIDENDS': 'Dividendos Anuais',
  'ASSET_QUANTITY': 'Quantidade de Ativos',
  'CUSTOM': 'Personalizada'
};

const GoalCard = ({ goal, onEdit, onDelete, onUpdateProgress }) => {
  const progress = goal.target_amount > 0
    ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
    : 0;

  const isCompleted = progress >= 100;
  const daysRemaining = goal.target_date
    ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  const getProgressColor = () => {
    if (isCompleted) return '#16a34a';
    if (progress >= 75) return '#2563eb';
    if (progress >= 50) return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div className="card" style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: 0 }}>
              {goal.title}
            </h3>
            {isCompleted && (
              <span style={{
                padding: '4px 12px',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                ✓ Concluída
              </span>
            )}
          </div>

          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
            {GOAL_TYPES[goal.type] || goal.type}
          </div>

          {goal.description && (
            <p style={{ fontSize: '14px', color: '#4b5563', margin: '8px 0' }}>
              {goal.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => onEdit(goal)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              backgroundColor: '#fef2f2',
              color: '#b91c1c',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Excluir
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          width: '100%',
          height: '12px',
          backgroundColor: '#e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: getProgressColor(),
            transition: 'width 0.3s ease',
            borderRadius: '6px'
          }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
            Valor Atual
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            {formatCurrency(goal.current_amount)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
            Meta
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            {formatCurrency(goal.target_amount)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
            Progresso
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: getProgressColor() }}>
            {progress.toFixed(1)}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
            Faltam
          </div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            {formatCurrency(Math.max(0, goal.target_amount - goal.current_amount))}
          </div>
        </div>

        {goal.target_date && (
          <div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
              Prazo
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: daysRemaining < 0 ? '#dc2626' : '#1f2937' }}>
              {daysRemaining < 0
                ? 'Vencida'
                : daysRemaining === 0
                  ? 'Hoje'
                  : `${daysRemaining} dias`
              }
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
              {formatDate(goal.target_date)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
