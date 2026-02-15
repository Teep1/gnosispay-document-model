# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Production-ready error handling with categorization
- Rate limiting for Etherscan API calls (5 req/s)
- Input validation with Zod schemas
- Comprehensive logging utility with log levels
- Environment configuration validation
- Security improvements (input sanitization, timeout handling)
- Exponential backoff retry logic for API failures
- Enhanced Etherscan API service with proper error handling
- TypeScript strict mode configuration
- Comprehensive documentation

### Changed
- Updated Etherscan API service to use production utilities
- Migrated from console.log to structured logger
- Improved error messages with user-friendly descriptions
- Enhanced TypeScript configuration with stricter checks

### Security
- Added rate limiting to prevent API abuse
- Input sanitization to prevent injection attacks
- API keys no longer logged or persisted
- Request timeout handling

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- CSV transaction import
- Etherscan API V2 integration
- Transaction analytics dashboard
- Multi-token support (USDC, GBPe, EURe)
- Balance timeline visualization
- Monthly income/expense breakdown
- Transaction filtering and sorting
