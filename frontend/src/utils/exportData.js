/**
 * Converte array de objetos para CSV
 * @param {Array} data - Array de objetos
 * @param {string} filename - Nome do arquivo
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';

        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
};

/**
 * Exporta transações para CSV
 * @param {Array} transactions - Array de transações
 */
export const exportTransactionsToCSV = (transactions) => {
  const data = transactions.map(tx => ({
    'Data': tx.date,
    'Tipo': tx.type === 'BUY' ? 'Compra' : 'Venda',
    'Ativo': tx.ticker,
    'Tipo de Ativo': tx.asset_type,
    'Quantidade': tx.quantity,
    'Preço': tx.price,
    'Taxas': tx.fees || 0,
    'Total': (tx.quantity * tx.price) + (tx.fees || 0),
    'Observações': tx.notes || ''
  }));

  const filename = `transacoes_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Exporta resumo do portfólio para CSV
 * @param {Array} summary - Array com resumo do portfólio
 * @param {Object} quotes - Mapa de cotações
 */
export const exportPortfolioToCSV = (summary, quotes = {}) => {
  const data = summary.map(item => {
    const currentPrice = quotes[item.ticker]?.price || 0;
    const currentValue = item.total_quantity * currentPrice;
    const profitLoss = currentValue - item.total_invested;
    const profitLossPercent = item.total_invested > 0
      ? (profitLoss / item.total_invested) * 100
      : 0;

    return {
      'Ativo': item.ticker,
      'Tipo': item.asset_type,
      'Quantidade': item.total_quantity,
      'Preço Médio': (item.total_invested / item.total_quantity).toFixed(2),
      'Total Investido': item.total_invested.toFixed(2),
      'Preço Atual': currentPrice.toFixed(2),
      'Valor Atual': currentValue.toFixed(2),
      'Lucro/Prejuízo': profitLoss.toFixed(2),
      'Rentabilidade %': profitLossPercent.toFixed(2)
    };
  });

  const filename = `portfolio_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Exporta metas para CSV
 * @param {Array} goals - Array de metas
 */
export const exportGoalsToCSV = (goals) => {
  const GOAL_TYPES = {
    'TOTAL_PORTFOLIO': 'Patrimônio Total',
    'MONTHLY_DIVIDENDS': 'Dividendos Mensais',
    'YEARLY_DIVIDENDS': 'Dividendos Anuais',
    'ASSET_QUANTITY': 'Quantidade de Ativos',
    'CUSTOM': 'Personalizada'
  };

  const data = goals.map(goal => {
    const progress = goal.target_amount > 0
      ? ((goal.current_amount / goal.target_amount) * 100).toFixed(2)
      : 0;

    return {
      'Título': goal.title,
      'Tipo': GOAL_TYPES[goal.type] || goal.type,
      'Descrição': goal.description || '',
      'Valor Alvo': goal.target_amount.toFixed(2),
      'Valor Atual': goal.current_amount.toFixed(2),
      'Progresso %': progress,
      'Prazo': goal.target_date || '',
      'Status': goal.status,
      'Criada em': goal.created_at.split('T')[0]
    };
  });

  const filename = `metas_${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Exporta dados analíticos para CSV
 * @param {Object} analyticsData - Objeto com dados analíticos
 */
export const exportAnalyticsToCSV = (analyticsData) => {
  const { evolution, distribution, topPerformers, metrics } = analyticsData;

  // Evolution data
  if (evolution && evolution.length > 0) {
    const evolutionData = evolution.map(item => ({
      'Data': item.date,
      'Investido': item.invested.toFixed(2),
      'Valor Atual': item.currentValue.toFixed(2),
      'Lucro/Prejuízo': item.profitLoss.toFixed(2)
    }));

    exportToCSV(evolutionData, `evolucao_patrimonial_${new Date().toISOString().split('T')[0]}.csv`);
  }

  // Top performers
  if (topPerformers && topPerformers.length > 0) {
    const performersData = topPerformers.map(item => ({
      'Ativo': item.ticker,
      'Tipo': item.type,
      'Quantidade': item.quantity,
      'Investido': item.invested.toFixed(2),
      'Valor Atual': item.currentValue.toFixed(2),
      'Lucro/Prejuízo': item.profitLoss.toFixed(2),
      'Rentabilidade %': item.percentGain.toFixed(2)
    }));

    exportToCSV(performersData, `performance_ativos_${new Date().toISOString().split('T')[0]}.csv`);
  }
};

/**
 * Função auxiliar para download de arquivo
 * @param {string} content - Conteúdo do arquivo
 * @param {string} filename - Nome do arquivo
 * @param {string} mimeType - Tipo MIME do arquivo
 */
const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob(['\ufeff' + content], { type: mimeType });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Exporta relatório completo em formato de texto estruturado
 * @param {Object} portfolioData - Dados completos do portfólio
 */
export const exportFullReport = (portfolioData) => {
  const { metrics, summary, transactions, goals } = portfolioData;
  const date = new Date().toLocaleDateString('pt-BR');

  let report = `RELATÓRIO DE PORTFÓLIO - ${date}\n`;
  report += `${'='.repeat(60)}\n\n`;

  // Métricas Gerais
  if (metrics) {
    report += `MÉTRICAS GERAIS\n`;
    report += `${'-'.repeat(60)}\n`;
    report += `Total Investido: R$ ${metrics.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    report += `Valor Atual: R$ ${metrics.currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    report += `Lucro/Prejuízo: R$ ${metrics.totalProfitLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n`;
    report += `Rentabilidade: ${metrics.percentGain.toFixed(2)}%\n`;
    report += `Ativos no Portfólio: ${metrics.assetCount}\n\n`;
  }

  // Resumo de Ativos
  if (summary && summary.length > 0) {
    report += `ATIVOS NO PORTFÓLIO\n`;
    report += `${'-'.repeat(60)}\n`;
    summary.forEach(asset => {
      report += `${asset.ticker} (${asset.asset_type})\n`;
      report += `  Quantidade: ${asset.total_quantity}\n`;
      report += `  Total Investido: R$ ${asset.total_invested.toFixed(2)}\n\n`;
    });
  }

  // Metas
  if (goals && goals.length > 0) {
    report += `METAS DE INVESTIMENTO\n`;
    report += `${'-'.repeat(60)}\n`;
    goals.forEach(goal => {
      const progress = ((goal.current_amount / goal.target_amount) * 100).toFixed(1);
      report += `${goal.title}\n`;
      report += `  Progresso: ${progress}% (R$ ${goal.current_amount.toFixed(2)} / R$ ${goal.target_amount.toFixed(2)})\n`;
      if (goal.target_date) report += `  Prazo: ${goal.target_date}\n`;
      report += `\n`;
    });
  }

  downloadFile(report, `relatorio_completo_${new Date().toISOString().split('T')[0]}.txt`, 'text/plain;charset=utf-8;');
};
