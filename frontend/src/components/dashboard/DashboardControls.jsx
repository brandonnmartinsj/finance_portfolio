import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const DashboardControls = ({ isEditing, onToggleEdit, onSave, onReset, onAddWidget }) => {
  const { theme, toggleTheme } = useTheme();
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  const availableWidgets = [
    { id: 'portfolio-summary', name: 'Resumo do Portfólio', icon: '📊' },
    { id: 'portfolio-evolution', name: 'Evolução Patrimonial', icon: '📈' },
    { id: 'asset-distribution', name: 'Distribuição por Ativo', icon: '🥧' },
    { id: 'sector-distribution', name: 'Distribuição por Setor', icon: '🏢' },
    { id: 'top-performers', name: 'Melhores e Piores', icon: '🏆' },
    { id: 'dividend-analysis', name: 'Análise de Dividendos', icon: '💰' }
  ];

  const handleAddWidget = (widgetId) => {
    if (onAddWidget) {
      onAddWidget(widgetId);
    }
    setShowWidgetMenu(false);
  };

  return (
    <div className="dashboard-controls">
      <div className="control-group">
        <button
          className={`control-btn ${theme === 'dark' ? 'active' : ''}`}
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Tema Escuro' : 'Tema Claro'}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>

        <button
          className={`control-btn ${isEditing ? 'active' : ''}`}
          onClick={onToggleEdit}
          title={isEditing ? 'Modo Visualização' : 'Modo Edição'}
        >
          {isEditing ? '👁️' : '✏️'}
        </button>

        {isEditing && (
          <>
            <div className="widget-menu-container">
              <button
                className="control-btn"
                onClick={() => setShowWidgetMenu(!showWidgetMenu)}
                title="Adicionar Widget"
              >
                ➕
              </button>

              {showWidgetMenu && (
                <div className="widget-menu">
                  <div className="widget-menu-header">
                    <h4>Adicionar Widget</h4>
                    <button
                      className="close-btn"
                      onClick={() => setShowWidgetMenu(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="widget-menu-items">
                    {availableWidgets.map(widget => (
                      <button
                        key={widget.id}
                        className="widget-menu-item"
                        onClick={() => handleAddWidget(widget.id)}
                      >
                        <span className="widget-icon">{widget.icon}</span>
                        <span className="widget-name">{widget.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className="control-btn save-btn"
              onClick={onSave}
              title="Salvar Layout"
            >
              💾 Salvar
            </button>

            <button
              className="control-btn reset-btn"
              onClick={onReset}
              title="Resetar Layout"
            >
              🔄 Resetar
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardControls;
