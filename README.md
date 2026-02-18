# Gnosis Pay Transaction Analytics

A Powerhouse document model for tracking and analyzing blockchain transactions from Gnosis Pay card spending with multi-token and forex support.

## Features

- 📊 **Transaction Import**: Import transactions via CSV files or directly from Etherscan API
- 🔍 **Multi-Token Support**: Track USDC, GBPe, EURe, and other ERC-20 tokens
- 📈 **Analytics Dashboard**: Visualize spending patterns, balance over time, and monthly breakdowns
- 🔄 **Auto-Refresh**: Incrementally fetch new transactions from Etherscan
- 🔒 **Production Ready**: Rate limiting, input validation, error handling, and comprehensive logging

## Quick Start

### Prerequisites

- Node.js 18+
- npm or bun
- Etherscan API key (free tier available at [etherscan.io/apis](https://etherscan.io/apis))

### Installation

```bash
# Clone the repository
git clone https://github.com/Teep1/gnosispay-document-model.git
cd gnosispay-document-model

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your settings
# VITE_TRACKED_ETH_ADDRESS=your_wallet_address
```

### Development

```bash
# Start the Connect app in studio mode
npm run connect

# Run tests
npm test

# Build for production
npm run build

# Run linting
npm run lint
npm run lint:fix
```

### Using the Analytics Tool

1. **Start the application**: `npm run connect`
2. **Create a new document**: In Connect, create a new CryptoTransactionAnalytics document
3. **Import transactions**:
   - **CSV Upload**: Export transactions from GnosisScan or your wallet and upload the CSV
   - **Etherscan API**: Enter your API key and Gnosis Chain address to fetch transactions directly
4. **View analytics**: The dashboard shows:
   - Token balances and summaries
   - Balance over time chart
   - Monthly income/expense breakdown
   - Transaction history with filters

## Architecture

### Document Model

The application uses a Powerhouse document model with three main modules:

1. **Transaction Management**: Import, add, update, and delete transactions
2. **Currency Management**: Set base currency and exchange rates
3. **Analytics**: Calculate spending analytics and aggregations

### State Structure

```typescript
{
  transactions: Transaction[];
  analytics: Analytics | null;
  metadata: TransactionMetadata | null;
  settings: {
    baseCurrency: Currency;
    lastForexUpdate: DateTime | null;
    exchangeRates: ExchangeRate[];
  };
}
```

### Key Components

- **CsvUploader**: Handles CSV file parsing and validation
- **EtherscanUploader**: Integrates with Etherscan API V2 with rate limiting
- **Editor**: Main analytics dashboard with visualizations

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_TRACKED_ETH_ADDRESS` | No | `0x0000...0000` | Default wallet address to track |
| `VITE_EXCLUDED_CONTRACT_ADDRESS` | No | `0x0000...0000` | Contract to exclude from analysis |
| `VITE_LOG_LEVEL` | No | `warn` | Log verbosity (debug/info/warn/error/silent) |
| `VITE_ENABLE_DEBUG` | No | `false` | Enable debug UI elements |
| `VITE_API_TIMEOUT` | No | `30000` | API request timeout in ms |

### Security Features

- **Rate Limiting**: 5 requests/second to Etherscan API (configurable)
- **Input Validation**: Zod schemas validate all user inputs
- **API Key Security**: Keys entered in UI, never persisted to storage
- **Error Handling**: Structured error categorization with user-friendly messages
- **Sanitization**: Input sanitization prevents injection attacks

## API Integration

### Etherscan API Service

The `EtherscanApiService` provides:

- Automatic rate limiting with token bucket algorithm
- Exponential backoff retry logic for failed requests
- Request timeout handling
- Comprehensive error categorization

```typescript
import { EtherscanApiService } from "./services/etherscanApi";

const service = new EtherscanApiService(apiKey, 100); // 100 = Gnosis Chain
const transactions = await service.fetchERC20Transactions(address, {
  startBlock: 0,
  endBlock: "latest",
});
```

### Rate Limits

Etherscan API V2 free tier:
- 5 calls/second
- 100,000 calls/day

The service automatically enforces these limits and queues requests when needed.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage (if configured)
npm run test:coverage
```

### Test Structure

```
document-models/crypto-transaction-analytics/src/tests/
├── document-model.test.ts      # Document model lifecycle tests
├── transaction-management.test.ts  # Transaction CRUD tests
├── currency-management.test.ts     # Currency operations tests
└── analytics.test.ts              # Analytics calculation tests
```

## Production Deployment

### Pre-deployment Checklist

- [ ] Set `VITE_LOG_LEVEL=warn` or `error`
- [ ] Set `VITE_ENABLE_DEBUG=false`
- [ ] Configure appropriate `VITE_API_TIMEOUT`
- [ ] Run full test suite: `npm test`
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`

### Build Output

The build creates:
- `dist/index.js` - Main entry point
- `dist/index.d.ts` - Type definitions
- `dist/document-models/` - Document model exports
- `dist/editors/` - Editor components
- `dist/style.css` - Compiled Tailwind styles

### Integration with Powerhouse

This package integrates with the Powerhouse ecosystem:

- **Connect**: Document editor and viewer
- **Reactor**: Document processing and storage
- **Vetra**: Advanced analytics and subgraphs

## Troubleshooting

### Common Issues

**"Rate limit exceeded" error**
- Wait a few seconds and try again
- The service automatically enforces 5 req/s limit

**"Invalid API Key" error**
- Verify your Etherscan API key at [etherscan.io/apis](https://etherscan.io/apis)
- Ensure no spaces or extra characters in the key

**"No transactions found"**
- Verify the address has ERC-20 transactions on Gnosis Chain
- Check that the correct network (chainId: 100) is selected

**CSV import fails**
- Ensure CSV has proper headers (Transaction Hash, DateTime, etc.)
- Check that values are properly escaped if they contain commas
- Maximum file size: 5MB

### Debug Mode

Enable debug logging in `.env`:
```
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEBUG=true
```

Then check browser console for detailed logs.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style (enforced by ESLint/Prettier)
- Add tests for new functionality
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## License

AGPL-3.0-only

## Support

For issues and feature requests, please use the [GitHub issue tracker](https://github.com/Teep1/gnosispay-document-model/issues).

## Acknowledgments

- Built with [Powerhouse](https://powerhouse.inc)
- Gnosis Pay integration
- Etherscan API V2
