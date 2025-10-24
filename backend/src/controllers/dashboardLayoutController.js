import DashboardLayout from '../models/DashboardLayout.js';

export const getAllLayouts = (req, res) => {
  try {
    const layouts = DashboardLayout.getAll(req.user.id);
    res.json(layouts);
  } catch (error) {
    console.error('Error getting layouts:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getActiveLayout = (req, res) => {
  try {
    const layout = DashboardLayout.getActive(req.user.id);
    res.json(layout || null);
  } catch (error) {
    console.error('Error getting active layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getLayoutById = (req, res) => {
  try {
    const layout = DashboardLayout.getById(req.params.id, req.user.id);
    if (!layout) {
      return res.status(404).json({ error: 'Layout não encontrado' });
    }
    res.json(layout);
  } catch (error) {
    console.error('Error getting layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createLayout = (req, res) => {
  try {
    const { name, layoutConfig, theme, isActive } = req.body;

    if (!name || !layoutConfig) {
      return res.status(400).json({ error: 'Nome e configuração do layout são obrigatórios' });
    }

    const layout = DashboardLayout.create(req.body, req.user.id);
    res.status(201).json(layout);
  } catch (error) {
    console.error('Error creating layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const updateLayout = (req, res) => {
  try {
    const layout = DashboardLayout.update(req.params.id, req.body, req.user.id);
    if (!layout) {
      return res.status(404).json({ error: 'Layout não encontrado' });
    }
    res.json(layout);
  } catch (error) {
    console.error('Error updating layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const setActiveLayout = (req, res) => {
  try {
    const layout = DashboardLayout.setActive(req.params.id, req.user.id);
    if (!layout) {
      return res.status(404).json({ error: 'Layout não encontrado' });
    }
    res.json(layout);
  } catch (error) {
    console.error('Error setting active layout:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteLayout = (req, res) => {
  try {
    DashboardLayout.delete(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting layout:', error);
    res.status(500).json({ error: error.message });
  }
};
