# Plano de Implementação: Web Scraping Fundamentus

## Objetivo
Implementar scraping do site Fundamentus (https://fundamentus.com.br) para obter dados financeiros completos de ações brasileiras, substituindo/complementando os dados da API Brapi.

## Análise do Site

### URL Pattern
```
https://fundamentus.com.br/detalhes.php?papel={TICKER}
```
- Ticker sem sufixo .SA (ex: SAPR3, PETR4, VALE3)

### Dados Disponíveis

#### 1. Informações Básicas
- Papel (Ticker)
- Tipo (ON, PN, UNIT)
- Empresa
- Setor
- Subsetor
- Cotação atual
- Data da última cotação
- Min/Max 52 semanas

#### 2. Oscilações (Performance)
- Dia %
- Mês %
- 30 dias %
- 12 meses %
- 2021, 2022, 2023, 2024, 2025 %

#### 3. Indicadores Fundamentalistas
- **Valuation:**
  - P/L (Preço/Lucro)
  - P/VP (Preço/Valor Patrimonial)
  - PSR (Price Sales Ratio)
  - P/Ativo
  - P/Cap. Giro
  - P/EBIT
  - P/Ativ. Circ. Liq.
  - EV/EBIT
  - EV/EBITDA

- **Rentabilidade:**
  - Margem Bruta
  - Margem EBIT
  - Margem Líquida
  - ROE (Retorno sobre Patrimônio)
  - ROA (Retorno sobre Ativos)
  - ROIC (Retorno sobre Capital Investido)

- **Dividendos:**
  - Div. Yield (Dividend Yield)
  - Payout

- **Crescimento:**
  - Cres. Rec. 5a (Crescimento Receita 5 anos)

- **Eficiência:**
  - Giro Ativos
  - Liquidez Corrente

#### 4. Balanço Patrimonial (em milhões/bilhões)
- Ativo Total
- Disponibilidades
- Ativo Circulante
- Dívida Bruta
- Dívida Líquida
- Patrimônio Líquido

#### 5. Demonstrativo de Resultados
- **Últimos 12 meses:**
  - Receita Líquida
  - EBIT
  - Lucro Líquido

- **Últimos 3 meses:**
  - Receita Líquida
  - EBIT
  - Lucro Líquido

#### 6. Informações por Ação
- LPA (Lucro por Ação)
- VPA (Valor Patrimonial por Ação)

## Estrutura Técnica

### Biblioteca de Scraping
**Escolha: Cheerio + Axios**
- Cheerio: jQuery-like para parsing HTML (leve e rápido)
- Axios: Requisições HTTP (já usado no projeto)

**Alternativas consideradas:**
- Puppeteer: Mais pesado, desnecessário (site não usa JS dinâmico)
- jsdom: Mais pesado que Cheerio

### Estratégias de Parsing

#### Desafio: Estrutura HTML sem classes/IDs
O Fundamentus usa estrutura simples sem identificadores únicos. Precisamos:

1. **Identificar tabelas por posição/contexto**
2. **Extrair pares chave-valor de células adjacentes**
3. **Normalizar valores (%, milhões, bilhões)**

#### Exemplo de Estrutura HTML Esperada:
```html
<table>
  <tr>
    <td class="label">P/L</td>
    <td class="data">5,14</td>
    <td class="label">P/VP</td>
    <td class="data">0,99</td>
  </tr>
</table>
```

## Arquitetura da Solução

### 1. Backend Service
**Arquivo:** `backend/src/services/fundamentusScraperService.js`

```javascript
class FundamentusScraperService {
  static async getDetailedData(ticker)
  static parseIndicators($, table)
  static parseBalanceSheet($, table)
  static parseIncomeStatement($, table)
  static normalizeValue(value)
  static convertToNumber(value)
}
```

**Funções principais:**
- `getDetailedData(ticker)`: Função principal que busca e parseia todos os dados
- `parseIndicators($, table)`: Extrai indicadores fundamentalistas
- `parseBalanceSheet($, table)`: Extrai balanço patrimonial
- `parseIncomeStatement($, table)`: Extrai DRE
- `normalizeValue(value)`: Converte strings em números (ex: "5,14" → 5.14, "24,9 bi" → 24900000000)

### 2. Backend Controller
**Arquivo:** `backend/src/controllers/marketController.js`

Nova função:
```javascript
export const getFundamentusData = async (req, res) => {
  const { ticker } = req.params;
  try {
    const data = await FundamentusScraperService.getDetailedData(ticker);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### 3. Backend Route
**Arquivo:** `backend/src/routes/market.js`

Nova rota:
```javascript
router.get('/fundamentus/:ticker', getFundamentusData);
```

### 4. Frontend Service
**Arquivo:** `frontend/src/services/api.js`

Novo método:
```javascript
export const marketService = {
  // ... métodos existentes
  getFundamentusData: (ticker) => api.get(`/market/fundamentus/${ticker}`)
};
```

### 5. Frontend Components

#### Nova página: `frontend/src/pages/FundamentalAnalysis.jsx`
Componente dedicado para análise fundamentalista detalhada com:
- Seções organizadas por categoria
- Visualização de indicadores
- Comparação com médias do setor
- Gráficos de evolução

#### Novos componentes:
- `frontend/src/components/fundamental/IndicatorsGrid.jsx`: Grid de indicadores
- `frontend/src/components/fundamental/BalanceSheetView.jsx`: Visualização do balanço
- `frontend/src/components/fundamental/IncomeStatementView.jsx`: Visualização da DRE
- `frontend/src/components/fundamental/ValuationMetrics.jsx`: Métricas de valuation

## Modelo de Dados

### Estrutura de Resposta da API

```typescript
interface FundamentusData {
  ticker: string;
  companyInfo: {
    name: string;
    sector: string;
    subsector: string;
    type: string; // ON, PN, UNIT
  };
  quote: {
    current: number;
    date: string;
    week52High: number;
    week52Low: number;
  };
  performance: {
    day: number;
    month: number;
    month30: number;
    year: number;
    year2021: number;
    year2022: number;
    year2023: number;
    year2024: number;
    year2025: number;
  };
  valuation: {
    priceToEarnings: number;      // P/L
    priceToBook: number;           // P/VP
    priceSalesRatio: number;       // PSR
    priceToAssets: number;         // P/Ativo
    priceToWorkingCapital: number; // P/Cap. Giro
    priceToEBIT: number;           // P/EBIT
    priceToNetCurrentAssets: number; // P/Ativ. Circ. Liq.
    evToEBIT: number;              // EV/EBIT
    evToEBITDA: number;            // EV/EBITDA
  };
  profitability: {
    grossMargin: number;           // Margem Bruta %
    ebitMargin: number;            // Margem EBIT %
    netMargin: number;             // Margem Líquida %
    roe: number;                   // ROE %
    roa: number;                   // ROA %
    roic: number;                  // ROIC %
  };
  dividends: {
    dividendYield: number;         // Div. Yield %
    payout: number;                // Payout %
  };
  growth: {
    revenue5y: number;             // Crescimento Receita 5a %
  };
  efficiency: {
    assetTurnover: number;         // Giro Ativos
    currentRatio: number;          // Liquidez Corrente
  };
  balanceSheet: {
    totalAssets: number;           // Ativo Total
    cash: number;                  // Disponibilidades
    currentAssets: number;         // Ativo Circulante
    grossDebt: number;             // Dívida Bruta
    netDebt: number;               // Dívida Líquida
    equity: number;                // Patrimônio Líquido
  };
  incomeStatement: {
    last12Months: {
      revenue: number;             // Receita Líquida
      ebit: number;                // EBIT
      netIncome: number;           // Lucro Líquido
    };
    last3Months: {
      revenue: number;
      ebit: number;
      netIncome: number;
    };
  };
  perShare: {
    earnings: number;              // LPA
    bookValue: number;             // VPA
  };
  metadata: {
    source: 'fundamentus';
    scrapedAt: string;             // ISO timestamp
  };
}
```

## Tratamento de Erros

### Cenários a Considerar

1. **Ticker inválido:** Fundamentus retorna página de erro
2. **Site fora do ar:** Timeout da requisição
3. **Mudança na estrutura HTML:** Parsing falha
4. **Rate limiting:** Muitas requisições em curto período
5. **Valores ausentes:** Alguns campos podem estar vazios

### Estratégias

1. **Fallback para Brapi:**
   - Se scraping falhar, usar dados da Brapi
   - Indicar fonte dos dados na resposta

2. **Cache:**
   - Implementar cache de 1 hora para reduzir requisições
   - Usar Redis ou cache em memória (node-cache)

3. **Retry Logic:**
   - Tentar 3 vezes com backoff exponencial
   - 1s, 2s, 4s entre tentativas

4. **Validação:**
   - Validar estrutura HTML antes de parsear
   - Verificar se campos críticos existem

5. **Logging:**
   - Log detalhado de erros de scraping
   - Monitorar taxa de sucesso

## Considerações Legais e Éticas

### Robots.txt
Verificar: `https://fundamentus.com.br/robots.txt`

### Terms of Service
- Revisar termos de uso do Fundamentus
- Respeitar rate limits implícitos
- Não sobrecarregar o servidor

### Boas Práticas
1. **User-Agent:** Identificar nossa aplicação
2. **Rate Limiting:** Máximo 1 requisição por segundo
3. **Cache:** Armazenar dados para reduzir requisições
4. **Respeito:** Não fazer scraping agressivo

## Implementação em Fases

### FASE 1: Setup e Estrutura Base
**Tempo estimado: 30min**

- [ ] Instalar dependências (cheerio)
- [ ] Criar `fundamentusScraperService.js`
- [ ] Implementar função básica de fetch
- [ ] Testar conexão com Fundamentus

**Arquivos:**
- `backend/package.json`
- `backend/src/services/fundamentusScraperService.js`

**Teste:**
```bash
curl http://localhost:3001/api/market/fundamentus/PETR4
```

### FASE 2: Parsing de Indicadores Básicos
**Tempo estimado: 1h**

- [ ] Implementar parsing de valuation (P/L, P/VP, etc)
- [ ] Implementar parsing de rentabilidade (ROE, ROA, etc)
- [ ] Implementar função de normalização de valores
- [ ] Testes unitários

**Arquivos:**
- `backend/src/services/fundamentusScraperService.js`
- `backend/src/services/__tests__/fundamentusScraperService.test.js`

### FASE 3: Parsing de Balanço e DRE
**Tempo estimado: 1h**

- [ ] Implementar parsing de balanço patrimonial
- [ ] Implementar parsing de DRE
- [ ] Implementar conversão de valores (milhões/bilhões)
- [ ] Testes unitários

**Arquivos:**
- `backend/src/services/fundamentusScraperService.js`

### FASE 4: Controller e Rotas
**Tempo estimado: 30min**

- [ ] Criar endpoint `/api/market/fundamentus/:ticker`
- [ ] Implementar controller com error handling
- [ ] Adicionar validação de ticker
- [ ] Testar endpoint

**Arquivos:**
- `backend/src/controllers/marketController.js`
- `backend/src/routes/market.js`

### FASE 5: Sistema de Cache
**Tempo estimado: 45min**

- [ ] Instalar node-cache
- [ ] Implementar cache layer no service
- [ ] Configurar TTL (1 hora)
- [ ] Adicionar logs de cache hit/miss

**Arquivos:**
- `backend/package.json`
- `backend/src/services/fundamentusScraperService.js`
- `backend/src/config/cache.js`

### FASE 6: Frontend - Service Layer
**Tempo estimado: 30min**

- [ ] Adicionar método `getFundamentusData` no api.js
- [ ] Criar hook `useFundamentusData`
- [ ] Implementar loading states
- [ ] Error handling

**Arquivos:**
- `frontend/src/services/api.js`
- `frontend/src/hooks/useFundamentusData.js`

### FASE 7: Frontend - Componentes de Indicadores
**Tempo estimado: 2h**

- [ ] Criar `IndicatorsGrid.jsx` para exibir indicadores
- [ ] Criar `ValuationMetrics.jsx` para métricas de valuation
- [ ] Criar `ProfitabilityMetrics.jsx` para rentabilidade
- [ ] Adicionar tooltips explicativos
- [ ] Styling responsivo

**Arquivos:**
- `frontend/src/components/fundamental/IndicatorsGrid.jsx`
- `frontend/src/components/fundamental/ValuationMetrics.jsx`
- `frontend/src/components/fundamental/ProfitabilityMetrics.jsx`

### FASE 8: Frontend - Componentes Financeiros
**Tempo estimado: 2h**

- [ ] Criar `BalanceSheetView.jsx`
- [ ] Criar `IncomeStatementView.jsx`
- [ ] Adicionar visualizações gráficas (pizza, barras)
- [ ] Implementar comparações percentuais
- [ ] Styling

**Arquivos:**
- `frontend/src/components/fundamental/BalanceSheetView.jsx`
- `frontend/src/components/fundamental/IncomeStatementView.jsx`

### FASE 9: Frontend - Página de Análise Fundamentalista
**Tempo estimado: 1.5h**

- [ ] Criar `FundamentalAnalysis.jsx`
- [ ] Integrar todos os componentes
- [ ] Adicionar breadcrumb
- [ ] Adicionar seções colapsáveis
- [ ] Loading states e error handling
- [ ] Responsive design

**Arquivos:**
- `frontend/src/pages/FundamentalAnalysis.jsx`
- `frontend/src/App.jsx` (adicionar rota)

### FASE 10: Integração e Melhorias
**Tempo estimado: 1h**

- [ ] Integrar com página `AssetDetails.jsx`
- [ ] Adicionar botão "Ver Análise Fundamentalista Completa"
- [ ] Implementar fallback para Brapi em caso de erro
- [ ] Adicionar indicador de fonte de dados
- [ ] Documentação da API

**Arquivos:**
- `frontend/src/pages/AssetDetails.jsx`
- `README.md`

### FASE 11: Testes e Ajustes Finais
**Tempo estimado: 1h**

- [ ] Testes end-to-end
- [ ] Testar com múltiplos tickers
- [ ] Verificar performance
- [ ] Ajustes de UX
- [ ] Code review

## Dependências a Adicionar

### Backend
```json
{
  "cheerio": "^1.0.0-rc.12",
  "node-cache": "^5.1.2"
}
```

### Frontend
Nenhuma nova dependência necessária (usar libs existentes)

## Estrutura de Arquivos Final

```
backend/
├── src/
│   ├── services/
│   │   ├── fundamentusScraperService.js (NOVO)
│   │   └── marketDataService.js
│   ├── controllers/
│   │   └── marketController.js (MODIFICADO)
│   ├── routes/
│   │   └── market.js (MODIFICADO)
│   └── config/
│       └── cache.js (NOVO)

frontend/
├── src/
│   ├── pages/
│   │   ├── FundamentalAnalysis.jsx (NOVO)
│   │   ├── AssetDetails.jsx (MODIFICADO)
│   │   └── Dashboard.jsx
│   ├── components/
│   │   └── fundamental/ (NOVO)
│   │       ├── IndicatorsGrid.jsx
│   │       ├── ValuationMetrics.jsx
│   │       ├── ProfitabilityMetrics.jsx
│   │       ├── BalanceSheetView.jsx
│   │       └── IncomeStatementView.jsx
│   ├── hooks/
│   │   └── useFundamentusData.js (NOVO)
│   └── services/
│       └── api.js (MODIFICADO)
```

## Estimativa de Tempo Total

| Fase | Tempo | Acumulado |
|------|-------|-----------|
| FASE 1 | 30min | 30min |
| FASE 2 | 1h | 1h 30min |
| FASE 3 | 1h | 2h 30min |
| FASE 4 | 30min | 3h |
| FASE 5 | 45min | 3h 45min |
| FASE 6 | 30min | 4h 15min |
| FASE 7 | 2h | 6h 15min |
| FASE 8 | 2h | 8h 15min |
| FASE 9 | 1.5h | 9h 45min |
| FASE 10 | 1h | 10h 45min |
| FASE 11 | 1h | 11h 45min |

**Total: ~12 horas de desenvolvimento**

## Exemplo de Uso Final

### Backend
```bash
# Obter dados do Fundamentus
curl http://localhost:3001/api/market/fundamentus/PETR4

# Response:
{
  "ticker": "PETR4",
  "companyInfo": {
    "name": "PETROBRAS PN",
    "sector": "Petróleo, Gás e Biocombustíveis",
    "type": "PN"
  },
  "valuation": {
    "priceToEarnings": 3.21,
    "priceToBook": 0.89,
    "evToEBITDA": 2.45
  },
  "profitability": {
    "roe": 27.5,
    "roa": 12.3,
    "netMargin": 18.7
  },
  "dividends": {
    "dividendYield": 12.5,
    "payout": 40.2
  },
  "balanceSheet": {
    "totalAssets": 1234000000000,
    "netDebt": 456000000000,
    "equity": 890000000000
  },
  "metadata": {
    "source": "fundamentus",
    "scrapedAt": "2025-10-22T15:30:00.000Z"
  }
}
```

### Frontend
```javascript
// Hook
const { data, loading, error } = useFundamentusData('PETR4');

// Componente
<FundamentalAnalysis ticker="PETR4" />
```

## Próximos Passos

1. **Aprovar o plano** e começar implementação
2. **Escolher abordagem:**
   - Sequencial (fase por fase)
   - Paralela (backend + frontend simultaneamente)
   - MVP primeiro (fases 1-4, depois resto)
3. **Definir prioridades:** Quais indicadores são mais importantes?

## Observações Importantes

### Limitações do Scraping
- Dependência da estrutura HTML do Fundamentus
- Possíveis mudanças no site quebram o parser
- Performance menor que APIs REST

### Alternativas Consideradas
- **API paga:** Status Invest, Eleven Financial
- **Database local:** Baixar dados manualmente
- **Hybrid:** Scraping + Brapi para redundância

### Recomendação
Implementar scraping com fallback para Brapi, monitorar taxa de sucesso, e considerar migração para API paga no futuro se o projeto crescer.
