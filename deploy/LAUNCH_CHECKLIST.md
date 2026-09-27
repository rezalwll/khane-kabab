# Launch checklist

## Infrastructure

- [ ] PostgreSQL reachable
- [ ] HTTPS valid
- [ ] `/ready` healthy
- [ ] backups configured

## Database

- [ ] migrations applied from a clean database
- [ ] initial seed completed exactly once
- [ ] owner bootstrap completed and bootstrap password removed

## Admin

- [ ] login works
- [ ] menu reviewed
- [ ] prices reviewed
- [ ] availability reviewed
- [ ] delivery fee reviewed
- [ ] minimum order reviewed
- [ ] opening hours reviewed
- [ ] `ordersEnabled` checked

## Customer

- [ ] home and menu load from DB
- [ ] product detail and required options work
- [ ] delivery COD E2E completed
- [ ] pickup COD E2E completed
- [ ] coupon verified
- [ ] tracking verified through terminal status
- [ ] admin status reflected customer-side
- [ ] admin price/availability/delivery/minimum/method switches reflected storefront-side

## Providers

- [ ] online payment remains disabled
- [ ] SMS remains disabled unless a real provider is connected

## Operations

- [ ] notification worker running
- [ ] session cleanup scheduled
- [ ] backup completed
- [ ] backup restored into a separate database and verified
- [ ] logs reviewed for secrets and PII
