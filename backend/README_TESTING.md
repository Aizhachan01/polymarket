# Testing Guide

## Setup

Tests menggunakan Jest dengan ES modules support. Pastikan environment variables sudah di-set di `.env`:

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

## Menjalankan Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Cleanup test data manually (jika cleanup tidak bekerja)
npm run test:cleanup
```

## Cleanup Test Data

**PENTING**: Tests membuat data betulan di database. Pastikan cleanup bekerja!

Jika database penuh dengan test data:

```bash
# Run cleanup script manual
npm run test:cleanup
```

Atau langsung di Supabase SQL Editor:

```sql
-- Delete test bets
DELETE FROM bets WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'test-%' OR username LIKE 'testuser-%'
);

-- Delete test markets
DELETE FROM markets WHERE title LIKE 'Test Market%' 
  OR title LIKE 'Admin Created Market%' 
  OR title LIKE 'Market to Resolve%';

-- Delete test users
DELETE FROM users WHERE email LIKE 'test-%' OR username LIKE 'testuser-%';
```

## Test Structure

```
backend/
├── __tests__/
│   ├── database/
│   │   └── connection.test.js      # Database connection tests
│   ├── services/
│   │   ├── userService.test.js     # User service unit tests
│   │   ├── marketService.test.js   # Market service unit tests
│   │   └── betService.test.js      # Bet service unit tests
│   └── api/
│       ├── markets.test.js         # Markets API integration tests
│       ├── admin.test.js           # Admin API integration tests
│       └── bets.test.js            # Bets API integration tests
└── tests/
    ├── setup.js                    # Test setup configuration
    └── helpers/
        └── database.js             # Database test helpers (cleanup, create test data)
```

## Test Types

### 1. Database Connection Tests
- Test koneksi ke Supabase
- Test query ke semua tables (users, markets, bets)
- Test error handling

### 2. Unit Tests (Services)
- **User Service**: getUserById, getUserByEmail, createUser, updateUserBalance, addPointsToUser
- **Market Service**: createMarket, getMarketById, getMarkets, resolveMarket
- **Bet Service**: placeBet, getUserBets, getMarketBets, getMarketPools

### 3. Integration Tests (API)
- **Markets API**: GET /api/markets, GET /api/markets/:id, GET /api/markets/:id/bets
- **Admin API**: POST /api/admin/markets, POST /api/admin/markets/:id/resolve, POST /api/admin/users/add-points
- **Bets API**: POST /api/bets

## Test Helpers

File `tests/helpers/database.js` menyediakan helper functions:
- `cleanupTestData()` - Clean up test data setelah test
- `createTestUser()` - Create test user
- `createTestMarket()` - Create test market
- `forceCleanupAllTestData()` - Force cleanup (untuk manual cleanup)

## Notes

- Tests menggunakan database yang sama dengan development (Supabase)
- Test data akan di-cleanup setelah setiap test suite (beforeEach/afterEach)
- **Jika cleanup tidak bekerja**, run `npm run test:cleanup` untuk cleanup manual
- Pastikan RLS disabled atau test user memiliki permission untuk test operations
- Untuk production, gunakan test database terpisah
