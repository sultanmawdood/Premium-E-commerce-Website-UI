# Security Configuration and Guidelines

## Package Security

### Vulnerability Prevention
- Run `npm audit` before every deployment
- Update dependencies regularly using `npm update`
- Use `npm ci` in production for reproducible builds
- Monitor security advisories for critical packages

### Secure Package Management
```bash
# Check for vulnerabilities
npm run security:audit

# Fix vulnerabilities automatically
npm run security:fix

# Update packages and check security
npm run security:update

# Check for outdated packages
npm run security:check
```

### Critical Security Packages
- **helmet**: Security headers middleware
- **express-rate-limit**: Rate limiting protection
- **express-mongo-sanitize**: NoSQL injection prevention
- **express-validator**: Input validation and sanitization
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token management

### Removed Vulnerable Packages
- **csurf**: Deprecated CSRF package (replaced with custom implementation)

### Package Update Policy
- **Major versions**: Review breaking changes before updating
- **Minor/Patch versions**: Update regularly for security fixes
- **Security patches**: Apply immediately

### Monitoring
- Enable GitHub Dependabot alerts
- Use `npm audit` in CI/CD pipeline
- Regular security reviews of dependencies

### Environment Security
- Use environment variables for sensitive configuration
- Never commit secrets to version control
- Use secure random password generation
- Implement proper CSRF protection
- Enable security headers via Helmet

## Vulnerability Response
1. Identify vulnerable package via `npm audit`
2. Check for available fixes or updates
3. Test updates in development environment
4. Apply fixes and verify functionality
5. Deploy to production
6. Document changes in security log

## Security Contacts
- Security Team: security@kingsports.com
- Emergency: security-emergency@kingsports.com