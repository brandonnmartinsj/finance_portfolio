export { default as WidgetContainer } from './WidgetContainer';
export { default as PortfolioSummaryWidget } from './PortfolioSummaryWidget';
export { default as PortfolioEvolutionWidget } from './PortfolioEvolutionWidget';
export { default as AssetDistributionWidget } from './AssetDistributionWidget';
export { default as SectorDistributionWidget } from './SectorDistributionWidget';
export { default as TopPerformersWidget } from './TopPerformersWidget';
export { default as DividendAnalysisWidget } from './DividendAnalysisWidget';

export const WIDGET_TYPES = {
  PORTFOLIO_SUMMARY: 'portfolio-summary',
  PORTFOLIO_EVOLUTION: 'portfolio-evolution',
  ASSET_DISTRIBUTION: 'asset-distribution',
  SECTOR_DISTRIBUTION: 'sector-distribution',
  TOP_PERFORMERS: 'top-performers',
  DIVIDEND_ANALYSIS: 'dividend-analysis'
};

export const WIDGET_CONFIG = {
  [WIDGET_TYPES.PORTFOLIO_SUMMARY]: {
    title: 'Resumo do Portfólio',
    component: 'PortfolioSummaryWidget',
    minW: 2,
    minH: 2,
    defaultW: 4,
    defaultH: 2
  },
  [WIDGET_TYPES.PORTFOLIO_EVOLUTION]: {
    title: 'Evolução Patrimonial',
    component: 'PortfolioEvolutionWidget',
    minW: 3,
    minH: 3,
    defaultW: 6,
    defaultH: 4
  },
  [WIDGET_TYPES.ASSET_DISTRIBUTION]: {
    title: 'Distribuição por Ativo',
    component: 'AssetDistributionWidget',
    minW: 2,
    minH: 3,
    defaultW: 3,
    defaultH: 4
  },
  [WIDGET_TYPES.SECTOR_DISTRIBUTION]: {
    title: 'Distribuição por Setor',
    component: 'SectorDistributionWidget',
    minW: 2,
    minH: 3,
    defaultW: 3,
    defaultH: 4
  },
  [WIDGET_TYPES.TOP_PERFORMERS]: {
    title: 'Melhores e Piores',
    component: 'TopPerformersWidget',
    minW: 2,
    minH: 3,
    defaultW: 3,
    defaultH: 4
  },
  [WIDGET_TYPES.DIVIDEND_ANALYSIS]: {
    title: 'Análise de Dividendos',
    component: 'DividendAnalysisWidget',
    minW: 3,
    minH: 3,
    defaultW: 6,
    defaultH: 4
  }
};
