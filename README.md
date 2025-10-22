# Portfolio de Investimentos

Sistema web completo para gerenciamento de portfolio de investimentos pessoais, com suporte a ações brasileiras, ações americanas e renda fixa (Tesouro Direto).

## Características

- **Backend REST API** com Node.js, Express e SQLite
- **Frontend React** com Vite
- **Integração com APIs financeiras**:
  - Brapi - para ações brasileiras
  - Yahoo Finance - para ações americanas e internacionais
- **Funcionalidades**:
  - Registro de compras e vendas de ativos
  - Visualização do portfolio com cotações em tempo real
  - Cálculo automático de lucro/prejuízo
  - Preço médio de compra
  - Histórico completo de transações
  - Suporte para ações (BR/US) e renda fixa

## Estrutura do Projeto

```
finance_portfolio/
├── backend/              # API REST
│   ├── src/
│   │   ├── config/      # Configuração do banco de dados
│   │   ├── models/      # Modelos de dados
│   │   ├── controllers/ # Controladores da API
│   │   ├── routes/      # Rotas da API
│   │   ├── services/    # Serviços (integração APIs)
│   │   └── server.js    # Servidor Express
│   ├── data/            # Banco de dados SQLite
│   └── package.json
│
└── frontend/            # Interface React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── pages/       # Páginas
    │   ├── services/    # Serviços de API
    │   ├── styles/      # Estilos CSS
    │   ├── App.jsx      # Componente principal
    │   └── main.jsx     # Entry point
    ├── index.html
    └── package.json
```

## Requisitos

- Node.js 18+ e npm

## Instalação

### 1. Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` (opcional):
```
PORT=3001
NODE_ENV=development
```

Inicie o servidor:
```bash
npm start
# ou para desenvolvimento com hot reload:
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie um arquivo `.env` (opcional):
```
VITE_API_URL=http://localhost:3001/api
```

Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:3000`

## Uso

### Adicionar Transação

1. Clique em "Nova Transação"
2. Selecione o tipo (Compra/Venda)
3. Escolha o tipo de ativo (Ação BR/US ou Renda Fixa)
4. Preencha os dados:
   - **Ticker**: código do ativo (ex: PETR4.SA, AAPL, IPCA-2035)
   - **Nome**: nome completo do ativo
   - **Quantidade**: número de ações/cotas
   - **Preço**: preço unitário pago
   - **Data**: data da operação
   - **Taxas**: corretagem e outras taxas (opcional)
5. Clique em "Salvar"

### Dashboard

O dashboard mostra:
- **Resumo geral**: total investido, valor atual, lucro/prejuízo
- **Posições**: lista de todos os ativos com cotações atualizadas
- **Histórico**: todas as transações realizadas

### Exemplos de Tickers

- **Ações Brasileiras**: PETR4.SA, VALE3.SA, ITUB4.SA
- **Ações Americanas**: AAPL, GOOGL, MSFT, TSLA
- **Renda Fixa**: SELIC-2029, IPCA-2035, PRE-2027

## API Endpoints

### Transações

- `GET /api/transactions` - Listar todas as transações
- `GET /api/transactions/:id` - Obter transação específica
- `POST /api/transactions` - Criar nova transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Excluir transação
- `GET /api/transactions/summary` - Resumo do portfolio

### Mercado

- `GET /api/market/quote/:ticker` - Cotação de um ativo
- `POST /api/market/quotes` - Cotações de múltiplos ativos
- `GET /api/market/tesouro-direto` - Taxas do Tesouro Direto

## Tecnologias Utilizadas

### Backend
- Node.js
- Express
- better-sqlite3 (banco de dados)
- Axios (requisições HTTP)
- CORS

### Frontend
- React 18
- Vite (build tool)
- Axios (cliente HTTP)

### APIs Externas
- Brapi (https://brapi.dev) - cotações de ações brasileiras
- Yahoo Finance API - cotações internacionais

## Estrutura do Banco de Dados

### Tabela: transactions
- id (INTEGER PRIMARY KEY)
- type (TEXT) - 'BUY' ou 'SELL'
- asset_type (TEXT) - tipo do ativo
- ticker (TEXT) - código do ativo
- quantity (REAL) - quantidade
- price (REAL) - preço unitário
- date (TEXT) - data da transação
- fees (REAL) - taxas
- notes (TEXT) - observações
- created_at (TEXT) - data de criação

### Tabela: assets
- ticker (TEXT PRIMARY KEY)
- name (TEXT) - nome do ativo
- type (TEXT) - tipo
- market (TEXT) - mercado (BR/US)

## Melhorias Futuras

- Autenticação de usuários
- Gráficos de evolução do portfolio
- Importação de transações via arquivo CSV
- Suporte a dividendos e proventos
- Alertas de preço
- Relatórios fiscais
- Suporte a criptomoedas
- API real do Tesouro Direto
- Backup automático do banco de dados

## Licença

MIT
