import React from 'react';

const WidgetContainer = ({ title, children, onRemove, onConfigure }) => {
  return (
    <div className="widget-container">
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        <div className="widget-actions">
          {onConfigure && (
            <button
              className="widget-action-btn"
              onClick={onConfigure}
              title="Configurar widget"
            >
              ⚙️
            </button>
          )}
          {onRemove && (
            <button
              className="widget-action-btn widget-action-remove"
              onClick={onRemove}
              title="Remover widget"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};

export default WidgetContainer;
