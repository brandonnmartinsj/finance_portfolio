import Asset from '../models/Asset.js';
import FundamentusScraperService from './fundamentusScraperService.js';
import MarketDataService from './marketDataService.js';

const SECTOR_MAPPING = {
  // Bancos
  'ITUB3': 'Financeiro', 'ITUB4': 'Financeiro', 'BBDC3': 'Financeiro', 'BBDC4': 'Financeiro',
  'BBAS3': 'Financeiro', 'SANB11': 'Financeiro', 'BBSE3': 'Financeiro',

  // Petróleo e Gás
  'PETR3': 'Petróleo e Gás', 'PETR4': 'Petróleo e Gás', 'PRIO3': 'Petróleo e Gás',
  'RRRP3': 'Petróleo e Gás', 'RECV3': 'Petróleo e Gás',

  // Vale e Mineração
  'VALE3': 'Mineração', 'GOAU4': 'Mineração', 'CMIN3': 'Mineração',

  // Elétricas
  'ELET3': 'Energia Elétrica', 'ELET6': 'Energia Elétrica', 'ENBR3': 'Energia Elétrica',
  'CPFE3': 'Energia Elétrica', 'CMIG4': 'Energia Elétrica', 'TAEE11': 'Energia Elétrica',
  'CPLE6': 'Energia Elétrica', 'EGIE3': 'Energia Elétrica', 'NEOE3': 'Energia Elétrica',

  // Telecomunicações
  'VIVT3': 'Telecomunicações', 'TIMS3': 'Telecomunicações', 'OIBR3': 'Telecomunicações',

  // Varejo
  'MGLU3': 'Varejo', 'LREN3': 'Varejo', 'ARZZ3': 'Varejo', 'BHIA3': 'Varejo',
  'VIIA3': 'Varejo', 'PETZ3': 'Varejo', 'CRFB3': 'Varejo', 'SOMA3': 'Varejo',

  // Alimentos e Bebidas
  'ABEV3': 'Alimentos e Bebidas', 'JBSS3': 'Alimentos e Bebidas', 'BEEF3': 'Alimentos e Bebidas',
  'MRFG3': 'Alimentos e Bebidas', 'SMTO3': 'Alimentos e Bebidas', 'BRFS3': 'Alimentos e Bebidas',

  // Construção
  'CYRE3': 'Construção Civil', 'MRVE3': 'Construção Civil', 'EZTC3': 'Construção Civil',
  'TEND3': 'Construção Civil', 'LAVV3': 'Construção Civil',

  // Siderurgia
  'GGBR4': 'Siderurgia', 'CSNA3': 'Siderurgia', 'USIM5': 'Siderurgia',

  // Saúde
  'HAPV3': 'Saúde', 'RDOR3': 'Saúde', 'GNDI3': 'Saúde', 'AALR3': 'Saúde',
  'FLRY3': 'Saúde', 'PARD3': 'Saúde',

  // Educação
  'COGN3': 'Educação', 'YDUQ3': 'Educação', 'ANIM3': 'Educação',

  // Papel e Celulose
  'SUZB3': 'Papel e Celulose', 'KLBN11': 'Papel e Celulose',

  // Tecnologia
  'TOTS3': 'Tecnologia', 'LWSA3': 'Tecnologia', 'MELI34': 'Tecnologia',

  // Transporte e Logística
  'RAIL3': 'Transporte', 'CCRO3': 'Transporte', 'AZUL4': 'Transporte',
  'GOLL4': 'Transporte', 'EMBR3': 'Transporte',

  // Seguros
  'BBSE3': 'Seguros', 'PSSA3': 'Seguros', 'CIEL3': 'Seguros',

  // Shoppings
  'MULT3': 'Shoppings', 'IGTI11': 'Shoppings', 'ALSO3': 'Shoppings',

  // Holdings
  'ITSA4': 'Holdings', 'TRPL4': 'Holdings',
};

const FII_SECTORS = {
  'HGLG11': 'FII - Logística',
  'XPLG11': 'FII - Logística',
  'VISC11': 'FII - Logística',

  'HGRE11': 'FII - Lajes Corporativas',
  'KNRI11': 'FII - Lajes Corporativas',
  'PVBI11': 'FII - Lajes Corporativas',

  'MXRF11': 'FII - Híbrido',
  'BTLG11': 'FII - Híbrido',
  'KNCR11': 'FII - Híbrido',

  'XPML11': 'FII - Shoppings',
  'VIUR11': 'FII - Shoppings',
  'HSML11': 'FII - Shoppings',
};

class SectorService {
  static async getSectorFromAPI(ticker) {
    try {
      const cleanTicker = ticker.replace('.SA', '');

      const fundamentusData = await FundamentusScraperService.getDetailedData(cleanTicker);
      if (fundamentusData?.companyInfo?.sector) {
        return fundamentusData.companyInfo.sector;
      }
    } catch (error) {
      console.log(`Fundamentus failed for ${ticker}, trying Brapi...`);
    }

    try {
      const brapiData = await MarketDataService.getFundamentalData(ticker);
      if (brapiData?.companyInfo?.sector && brapiData.companyInfo.sector !== 'N/A') {
        return brapiData.companyInfo.sector;
      }
    } catch (error) {
      console.log(`Brapi failed for ${ticker}`);
    }

    return null;
  }

  static async getSector(ticker, assetType, useCache = true) {
    const upperTicker = ticker.toUpperCase();
    const tickerWithSA = upperTicker.endsWith('.SA') ? upperTicker : `${upperTicker}.SA`;
    const tickerWithoutSA = upperTicker.replace('.SA', '');

    if (assetType === 'CRYPTO') {
      return 'Criptomoedas';
    }

    if (assetType === 'FIXED_INCOME') {
      return 'Renda Fixa';
    }

    if (useCache) {
      const asset = Asset.getByTicker(tickerWithSA) || Asset.getByTicker(tickerWithoutSA);
      if (asset?.sector) {
        return asset.sector;
      }
    }

    if (assetType === 'FII' || assetType === 'REIT') {
      const fiiSector = FII_SECTORS[tickerWithoutSA] || 'FII - Outros';

      try {
        Asset.upsert({
          ticker: tickerWithSA,
          name: tickerWithoutSA,
          type: assetType,
          market: 'BR',
          sector: fiiSector
        });
      } catch (error) {
        console.log(`Error saving FII sector: ${error.message}`);
      }

      return fiiSector;
    }

    if (assetType === 'STOCK' || assetType === 'BDR' || assetType === 'ACAO_BR') {
      let sector = SECTOR_MAPPING[tickerWithoutSA];

      if (!sector) {
        sector = await this.getSectorFromAPI(tickerWithSA);
      }

      if (sector) {
        try {
          Asset.upsert({
            ticker: tickerWithSA,
            name: tickerWithoutSA,
            type: assetType,
            market: 'BR',
            sector
          });
        } catch (error) {
          console.log(`Error saving sector: ${error.message}`);
        }

        return sector;
      }

      return 'Outros';
    }

    return 'Não Classificado';
  }

  static async getSectorDistribution(portfolioSummary, priceMap) {
    const sectorMap = {};

    for (const item of portfolioSummary) {
      if (item.total_quantity <= 0) continue;

      const currentPrice = priceMap[item.ticker];
      if (!currentPrice) continue;

      const value = item.total_quantity * currentPrice;
      const sector = await this.getSector(item.ticker, item.asset_type);

      if (!sectorMap[sector]) {
        sectorMap[sector] = {
          sector,
          value: 0,
          invested: 0,
          count: 0,
          assets: []
        };
      }

      sectorMap[sector].value += value;
      sectorMap[sector].invested += item.total_invested;
      sectorMap[sector].count += 1;
      sectorMap[sector].assets.push({
        ticker: item.ticker,
        value,
        invested: item.total_invested
      });
    }

    return Object.values(sectorMap)
      .map(sector => ({
        ...sector,
        profitLoss: sector.value - sector.invested,
        percentGain: sector.invested > 0 ? ((sector.value - sector.invested) / sector.invested) * 100 : 0
      }))
      .sort((a, b) => b.value - a.value);
  }

  static getAllSectors() {
    const allSectors = new Set([
      ...Object.values(SECTOR_MAPPING),
      ...Object.values(FII_SECTORS),
      'Criptomoedas',
      'Renda Fixa',
      'Outros',
      'Não Classificado'
    ]);

    return Array.from(allSectors).sort();
  }
}

export default SectorService;
