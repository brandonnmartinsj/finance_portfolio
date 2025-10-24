const BENCHMARK_DATA = {
  CDI: {
    name: 'CDI',
    description: 'Certificado de Depósito Interbancário',
    annual2024: 10.90,
    annual2023: 13.75,
    annual2022: 13.15,
    annual2021: 4.40,
    annual2020: 2.75
  },
  IBOV: {
    name: 'IBOVESPA',
    description: 'Índice Bovespa',
    annual2024: 8.50,
    annual2023: 22.28,
    annual2022: 4.69,
    annual2021: -11.93,
    annual2020: 2.92
  },
  IFIX: {
    name: 'IFIX',
    description: 'Índice de Fundos Imobiliários',
    annual2024: 4.20,
    annual2023: 12.10,
    annual2022: -0.48,
    annual2021: -5.87,
    annual2020: -6.22
  },
  POUPANCA: {
    name: 'Poupança',
    description: 'Caderneta de Poupança',
    annual2024: 7.87,
    annual2023: 9.62,
    annual2022: 7.90,
    annual2021: 2.94,
    annual2020: 2.11
  }
};

class BenchmarkService {
  static getAllBenchmarks() {
    return BENCHMARK_DATA;
  }

  static getBenchmark(benchmarkName) {
    return BENCHMARK_DATA[benchmarkName] || null;
  }

  static comparePortfolioToBenchmark(portfolioReturn, benchmarkName, year = null) {
    const benchmark = this.getBenchmark(benchmarkName);

    if (!benchmark) {
      return null;
    }

    let yearKey;
    let benchmarkReturn = 0;

    if (year) {
      yearKey = `annual${year}`;
      benchmarkReturn = benchmark[yearKey] || 0;
    } else {
      const currentYear = new Date().getFullYear();
      const availableYears = Object.keys(benchmark)
        .filter(key => key.startsWith('annual'))
        .map(key => parseInt(key.replace('annual', '')))
        .sort((a, b) => b - a);

      const targetYear = availableYears.find(y => y <= currentYear) || availableYears[0];
      yearKey = `annual${targetYear}`;
      benchmarkReturn = benchmark[yearKey] || 0;
    }

    const alpha = portfolioReturn - benchmarkReturn;
    const relativePerformance = benchmarkReturn !== 0
      ? (portfolioReturn / benchmarkReturn) * 100
      : 0;

    return {
      portfolioReturn: parseFloat(portfolioReturn.toFixed(2)),
      benchmarkReturn: parseFloat(benchmarkReturn.toFixed(2)),
      alpha: parseFloat(alpha.toFixed(2)),
      relativePerformance: parseFloat(relativePerformance.toFixed(2)),
      outperforming: alpha > 0
    };
  }

  static getHistoricalComparison(portfolioReturns) {
    const benchmarks = Object.keys(BENCHMARK_DATA);
    const comparison = {};

    benchmarks.forEach(benchmarkName => {
      const benchmark = BENCHMARK_DATA[benchmarkName];
      const years = Object.keys(benchmark).filter(key => key.startsWith('annual'));

      const yearlyComparison = years.map(yearKey => {
        const year = parseInt(yearKey.replace('annual', ''));
        const portfolioReturn = portfolioReturns[year] || 0;
        const benchmarkReturn = benchmark[yearKey];
        const alpha = portfolioReturn - benchmarkReturn;

        return {
          year,
          portfolioReturn: parseFloat(portfolioReturn.toFixed(2)),
          benchmarkReturn: parseFloat(benchmarkReturn.toFixed(2)),
          alpha: parseFloat(alpha.toFixed(2))
        };
      });

      comparison[benchmarkName] = {
        name: benchmark.name,
        description: benchmark.description,
        data: yearlyComparison
      };
    });

    return comparison;
  }

  static calculateBeta(portfolioReturns, marketReturns) {
    if (portfolioReturns.length !== marketReturns.length || portfolioReturns.length === 0) {
      return null;
    }

    const n = portfolioReturns.length;
    const portfolioMean = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
    const marketMean = marketReturns.reduce((sum, r) => sum + r, 0) / n;

    let covariance = 0;
    let marketVariance = 0;

    for (let i = 0; i < n; i++) {
      const portfolioDiff = portfolioReturns[i] - portfolioMean;
      const marketDiff = marketReturns[i] - marketMean;

      covariance += portfolioDiff * marketDiff;
      marketVariance += marketDiff * marketDiff;
    }

    if (marketVariance === 0) return null;

    const beta = covariance / marketVariance;
    return parseFloat(beta.toFixed(4));
  }

  static calculateSharpeRatio(portfolioReturn, riskFreeRate, volatility) {
    if (volatility === 0) return null;

    const excessReturn = portfolioReturn - riskFreeRate;
    const sharpeRatio = excessReturn / volatility;

    return parseFloat(sharpeRatio.toFixed(4));
  }
}

export default BenchmarkService;
