import Goal from '../models/Goal.js';

/**
 * Retorna todas as metas do usuário
 */
export const getAllGoals = (req, res) => {
  try {
    const goals = Goal.getAll(req.user.id);
    res.json(goals);
  } catch (error) {
    console.error('Error getting goals:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna apenas metas ativas
 */
export const getActiveGoals = (req, res) => {
  try {
    const goals = Goal.getActive(req.user.id);
    res.json(goals);
  } catch (error) {
    console.error('Error getting active goals:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retorna uma meta específica
 */
export const getGoalById = (req, res) => {
  try {
    const goal = Goal.getById(req.params.id, req.user.id);
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error getting goal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cria uma nova meta
 */
export const createGoal = (req, res) => {
  try {
    const { title, description, type, target_amount, current_amount, target_date } = req.body;

    if (!title || !type || !target_amount) {
      return res.status(400).json({ error: 'Título, tipo e valor alvo são obrigatórios' });
    }

    if (target_amount <= 0) {
      return res.status(400).json({ error: 'Valor alvo deve ser maior que zero' });
    }

    const goal = Goal.create(req.body, req.user.id);
    res.status(201).json(goal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualiza uma meta existente
 */
export const updateGoal = (req, res) => {
  try {
    const goal = Goal.update(req.params.id, req.body, req.user.id);
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Remove uma meta
 */
export const deleteGoal = (req, res) => {
  try {
    Goal.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualiza o progresso de uma meta
 */
export const updateGoalProgress = (req, res) => {
  try {
    const { current_amount } = req.body;

    if (current_amount === undefined || current_amount < 0) {
      return res.status(400).json({ error: 'Valor atual inválido' });
    }

    const goal = Goal.updateProgress(req.params.id, current_amount, req.user.id);
    if (!goal) {
      return res.status(404).json({ error: 'Meta não encontrada' });
    }

    res.json(goal);
  } catch (error) {
    console.error('Error updating goal progress:', error);
    res.status(500).json({ error: error.message });
  }
};
