# Security checklist

- [ ] `NODE_ENV=production`
- [ ] HTTPS valid end-to-end or to the trusted proxy
- [ ] `ADMIN_COOKIE_SECURE=true`
- [ ] no wildcard CORS/admin origins
- [ ] no default password
- [ ] bootstrap password removed after setup
- [ ] database not publicly exposed unnecessarily
- [ ] production secrets absent from repository and images
- [ ] payment provider disabled
- [ ] SMS provider disabled
- [ ] PII masked in logs and notification admin list
- [ ] backup storage encrypted/protected and access-limited
- [ ] restore procedure tested on an isolated database
- [ ] request body limit and process-local rate limits reviewed
