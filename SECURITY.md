# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. Email the maintainer directly with details
3. Allow reasonable time for response before public disclosure

## Security Measures

### Input Validation

All user inputs are validated using Zod schemas:
- Ethereum addresses are validated against the 0x... format
- API keys are sanitized before use
- CSV data is validated for proper structure

### Rate Limiting

Etherscan API calls are rate-limited:
- 5 requests per second (Etherscan free tier)
- Automatic queuing of excess requests
- Configurable limits via `RateLimiter` class

### API Key Security

- API keys are entered in UI only
- Keys are never stored in localStorage
- Keys are never logged to console
- Keys are sanitized before use

### Error Handling

- Errors are categorized and handled appropriately
- No sensitive data is exposed in error messages
- Stack traces are only shown in debug mode

## Security Best Practices

When deploying this application:

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique API keys
   - Rotate API keys regularly

2. **Network Security**
   - Use HTTPS in production
   - Configure appropriate CSP headers
   - Consider using a proxy for API calls

3. **Access Control**
   - Restrict access to the Connect/Reactor interfaces
   - Use authentication where available
   - Monitor access logs

4. **Dependencies**
   - Keep dependencies updated
   - Run `npm audit` regularly
   - Review new dependencies before adding

## Known Limitations

1. **Client-Side API Keys**: The Etherscan API key is entered in the browser. For production use with sensitive keys, consider:
   - Using a backend proxy
   - Implementing API key rotation
   - Limiting key permissions

2. **Local Storage**: Document data is stored locally. Ensure:
   - Device is secured
   - Regular backups are performed
   - Sensitive data is handled appropriately

## Security Updates

Security updates will be released as patch versions (e.g., 1.0.1).

Update checklist:
1. Review the security advisory
2. Update to the patched version
3. Rotate any potentially compromised credentials
4. Review access logs for suspicious activity
