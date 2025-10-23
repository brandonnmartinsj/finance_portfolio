import React, { useState, useEffect } from 'react';
import { goalsService } from '../services/api';
import GoalCard from '../components/goals/GoalCard';
import GoalForm from '../components/goals/GoalForm';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    loadGoals();
  }, [filter]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = filter === 'active'
        ? await goalsService.getActive()
        : await goalsService.getAll();

      setGoals(response.data);
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
      setError('Erro ao carregar metas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingGoal(null);
    setShowForm(true);
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setShowForm(true);
  };

  const handleSubmit = async (goalData) => {
    try {
      if (editingGoal) {
        await goalsService.update(editingGoal.id, goalData);
      } else {
        await goalsService.create(goalData);
      }

      setShowForm(false);
      setEditingGoal(null);
      loadGoals();
    } catch (err) {
      console.error('Erro ao salvar meta:', err);
      alert('Erro ao salvar meta. Tente novamente.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deseja realmente excluir esta meta?')) return;

    try {
      await goalsService.delete(id);
      loadGoals();
    } catch (err) {
      console.error('Erro ao excluir meta:', err);
      alert('Erro ao excluir meta. Tente novamente.');
    }
  };

  const handleUpdateProgress = async (id, currentAmount) => {
    try {
      await goalsService.updateProgress(id, currentAmount);
      loadGoals();
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
      alert('Erro ao atualizar progresso. Tente novamente.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div>Carregando metas...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
          <h2>{error}</h2>
          <button
            onClick={loadGoals}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const totalProgress = activeGoals.length > 0
    ? activeGoals.reduce((sum, g) => {
        const progress = g.target_amount > 0 ? (g.current_amount / g.target_amount) * 100 : 0;
        return sum + Math.min(progress, 100);
      }, 0) / activeGoals.length
    : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Metas de Investimento</h1>
          <p style={{ color: '#666', margin: 0 }}>Defina e acompanhe seus objetivos financeiros</p>
        </div>
        <button
          onClick={handleCreate}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          + Nova Meta
        </button>
      </div>

      {/* Summary Cards */}
      {activeGoals.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          <div className="card" style={{ padding: '20px', backgroundColor: '#eff6ff', borderLeft: '4px solid #2563eb' }}>
            <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Metas Ativas
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e3a8a' }}>
              {activeGoals.length}
            </div>
          </div>

          <div className="card" style={{ padding: '20px', backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Progresso Médio
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534' }}>
              {totalProgress.toFixed(1)}%
            </div>
          </div>

          <div className="card" style={{ padding: '20px', backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
            <div style={{ fontSize: '12px', color: '#a16207', marginBottom: '8px', fontWeight: '600', textTransform: 'uppercase' }}>
              Metas Concluídas
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#854d0e' }}>
              {completedGoals.length}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setFilter('active')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: filter === 'active' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: filter === 'active' ? '2px solid #2563eb' : 'none',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontWeight: filter === 'active' ? '600' : '500',
              fontSize: '15px'
            }}
          >
            Ativas ({activeGoals.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '12px 16px',
              backgroundColor: 'transparent',
              color: filter === 'all' ? '#2563eb' : '#6b7280',
              border: 'none',
              borderBottom: filter === 'all' ? '2px solid #2563eb' : 'none',
              marginBottom: '-2px',
              cursor: 'pointer',
              fontWeight: filter === 'all' ? '600' : '500',
              fontSize: '15px'
            }}
          >
            Todas ({goals.length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
            Nenhuma meta cadastrada
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Crie sua primeira meta de investimento para começar a acompanhar seus objetivos
          </p>
          <button
            onClick={handleCreate}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Criar Primeira Meta
          </button>
        </div>
      ) : (
        <div>
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      )}

      {/* Goal Form Modal */}
      {showForm && (
        <GoalForm
          goal={editingGoal}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default Goals;
