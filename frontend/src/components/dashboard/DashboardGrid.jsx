import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {
  PortfolioSummaryWidget,
  PortfolioEvolutionWidget,
  AssetDistributionWidget,
  SectorDistributionWidget,
  TopPerformersWidget,
  DividendAnalysisWidget,
  WIDGET_TYPES
} from '../widgets';
import { transactionService, marketService } from '../../services/api';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_LAYOUT = [
  { i: 'portfolio-summary', x: 0, y: 0, w: 6, h: 2, minW: 2, minH: 2 },
  { i: 'portfolio-evolution', x: 6, y: 0, w: 6, h: 4, minW: 3, minH: 3 },
  { i: 'asset-distribution', x: 0, y: 2, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'sector-distribution', x: 3, y: 2, w: 3, h: 4, minW: 2, minH: 3 },
  { i: 'top-performers', x: 0, y: 6, w: 6, h: 4, minW: 2, minH: 3 },
  { i: 'dividend-analysis', x: 6, y: 6, w: 6, h: 4, minW: 3, minH: 3 }
];

const DashboardGrid = ({ layout: initialLayout, onLayoutChange, isEditing = false }) => {
  const [layout, setLayout] = useState(initialLayout || DEFAULT_LAYOUT);
  const [summary, setSummary] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialLayout) {
      setLayout(initialLayout);
    }
  }, [initialLayout]);

  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      const summaryRes = await transactionService.getSummary();
      setSummary(summaryRes.data);

      if (summaryRes.data.length > 0) {
        const tickers = summaryRes.data.map(item => item.ticker);
        const quotesRes = await marketService.getMultipleQuotes(tickers);
        const quotesMap = {};
        quotesRes.data.forEach(quote => {
          if (quote.price) {
            quotesMap[quote.ticker] = quote;
          }
        });
        setQuotes(quotesMap);
      }
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  const handleRemoveWidget = (widgetId) => {
    const newLayout = layout.filter(item => item.i !== widgetId);
    setLayout(newLayout);
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  };

  const renderWidget = (widgetId) => {
    const removeHandler = isEditing ? () => handleRemoveWidget(widgetId) : null;

    switch (widgetId) {
      case 'portfolio-summary':
        return <PortfolioSummaryWidget data={summary} quotes={quotes} onRemove={removeHandler} />;

      case 'portfolio-evolution':
        return <PortfolioEvolutionWidget onRemove={removeHandler} />;

      case 'asset-distribution':
        return <AssetDistributionWidget onRemove={removeHandler} />;

      case 'sector-distribution':
        return <SectorDistributionWidget onRemove={removeHandler} />;

      case 'top-performers':
        return <TopPerformersWidget onRemove={removeHandler} />;

      case 'dividend-analysis':
        return <DividendAnalysisWidget onRemove={removeHandler} />;

      default:
        return <div>Widget desconhecido: {widgetId}</div>;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        Carregando dashboard...
      </div>
    );
  }

  return (
    <ResponsiveGridLayout
      className="dashboard-grid"
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={handleLayoutChange}
      isDraggable={isEditing}
      isResizable={isEditing}
      compactType="vertical"
      preventCollision={false}
    >
      {layout.map((item) => (
        <div key={item.i} className="dashboard-grid-item">
          {renderWidget(item.i)}
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};

export default DashboardGrid;
