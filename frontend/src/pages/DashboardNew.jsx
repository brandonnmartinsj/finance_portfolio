import React, { useState, useEffect } from 'react';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import DashboardControls from '../components/dashboard/DashboardControls';
import { layoutService } from '../services/layoutService';
import { WIDGET_CONFIG } from '../components/widgets';

const DEFAULT_LAYOUT = [
  { i: 'portfolio-summary', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
  { i: 'portfolio-evolution', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'asset-distribution', x: 0, y: 2, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'sector-distribution', x: 3, y: 2, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'top-performers', x: 0, y: 6, w: 6, h: 4, minW: 2, minH: 3 },
  { i: 'dividend-analysis', x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 }
];

const DashboardNew = () => {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [isEditing, setIsEditing] = useState(false);
  const [savedLayoutId, setSavedLayoutId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveLayout();
  }, []);

  const loadActiveLayout = async () => {
    try {
      setLoading(true);
      const response = await layoutService.getActive();

      if (response.data && response.data.layout_config) {
        const config = JSON.parse(response.data.layout_config);
        setLayout(config);
        setSavedLayoutId(response.data.id);
      } else {
        setLayout(DEFAULT_LAYOUT);
      }
    } catch (error) {
      console.error('Error loading active layout:', error);
      setLayout(DEFAULT_LAYOUT);
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveLayout = async () => {
    try {
      const layoutData = {
        name: `Layout ${new Date().toLocaleString('pt-BR')}`,
        layoutConfig: layout,
        isActive: true
      };

      if (savedLayoutId) {
        await layoutService.update(savedLayoutId, layoutData);
      } else {
        const response = await layoutService.create(layoutData);
        setSavedLayoutId(response.data.id);
      }

      alert('Layout salvo com sucesso!');
    } catch (error) {
      console.error('Error saving layout:', error);
      alert('Erro ao salvar layout');
    }
  };

  const handleResetLayout = () => {
    if (window.confirm('Deseja resetar o layout para o padrão?')) {
      setLayout(DEFAULT_LAYOUT);
    }
  };

  const handleAddWidget = (widgetId) => {
    const existingWidget = layout.find(item => item.i === widgetId);
    if (existingWidget) {
      alert('Este widget já está no dashboard');
      return;
    }

    const config = WIDGET_CONFIG[widgetId];
    if (!config) {
      alert('Widget não encontrado');
      return;
    }

    const maxY = layout.length > 0 ? Math.max(...layout.map(item => item.y + item.h)) : 0;

    const newWidget = {
      i: widgetId,
      x: 0,
      y: maxY,
      w: config.defaultW || 4,
      h: config.defaultH || 3,
      minW: config.minW || 2,
      minH: config.minH || 2
    };

    setLayout([...layout, newWidget]);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Carregando dashboard...
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard Personalizável</h1>
        <DashboardControls
          isEditing={isEditing}
          onToggleEdit={handleToggleEdit}
          onSave={handleSaveLayout}
          onReset={handleResetLayout}
          onAddWidget={handleAddWidget}
        />
      </div>

      {isEditing && (
        <div className="edit-mode-notice">
          Modo de edição ativo - Arraste e redimensione os widgets
        </div>
      )}

      <DashboardGrid
        layout={layout}
        onLayoutChange={handleLayoutChange}
        isEditing={isEditing}
      />
    </div>
  );
};

export default DashboardNew;
