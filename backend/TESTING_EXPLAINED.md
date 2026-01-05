# Penjelasan Testing

## Apakah Server Harus Berjalan?

**TIDAK**, server tidak perlu berjalan untuk menjalankan tests.

### Mengapa?

1. **Unit Tests (Services)**:

   - Test functions/services langsung tanpa HTTP server
   - Contoh: `userService.test.js`, `marketService.test.js`
   - Langsung import dan test functions

2. **Integration Tests (API)**:
   - Menggunakan **supertest** library
   - SuperTest test Express app secara **in-process** (tidak perlu HTTP server)
   - Import Express app langsung, tidak perlu start server
   - Contoh: `api/markets.test.js`, `api/bets.test.js`

```javascript
// Contoh dari api/bets.test.js
import request from 'supertest';
import app from '../../src/app.js';  // Import Express app, bukan server

// Test langsung tanpa start server
const response = await request(app)
  .post('/api/bets')
  .set('x-user-id', testUserId)
  .send({...});
```

## Apakah Tests Membuat Data Betulan di Database?

**YA**, tests menggunakan database yang **betulan** (real database).

### Bagaimana Cara Kerjanya?

1. **Real Database Connection**:

   - Tests connect ke Supabase database yang sama dengan development
   - Menggunakan environment variables dari `.env`
   - Bukan mock database, tapi real database

2. **Data yang Dibuat**:

   - Tests membuat data **betulan** di database
   - Contoh: test user, test market, test bets
   - Data ini **benar-benar ada** di database saat test berjalan

3. **Cleanup**:
   - Setelah test selesai, data test dihapus (cleanup)
   - Fungsi `cleanupTestData()` menghapus semua test data
   - Menghindari polusi data di database

### Contoh Flow Test:

```javascript
beforeEach(async () => {
  await cleanupTestData(); // Bersihkan data test sebelumnya
  const testUser = await createTestUser(); // Buat user BETULAN di database
  testUserId = testUser.id;
});

it("should place a bet", async () => {
  // Bet ini BENAR-BENAR dibuat di database
  const bet = await placeBet(testUserId, testMarketId, "YES", 100);

  // Assert bet yang BETULAN ada di database
  expect(bet).toBeDefined();
  expect(bet.amount).toBe(100);
});

afterEach(async () => {
  await cleanupTestData(); // Hapus semua data test
});
```

## Keuntungan & Kekurangan

### Keuntungan:

- ✅ Test dengan database yang **real**
- ✅ Bisa test database constraints, foreign keys, dll
- ✅ Test lebih akurat (mirip production)

### Kekurangan:

- ⚠️ Butuh koneksi database
- ⚠️ Lebih lambat daripada mock tests
- ⚠️ Bisa polusi data jika cleanup gagal (tapi sudah di-handle)

## Best Practice

Untuk production, idealnya:

1. Gunakan **test database terpisah** (bukan production database)
2. Atau gunakan **database transactions** (rollback setelah test)
3. Atau gunakan **mocking** untuk tests yang tidak perlu real database

Tapi untuk development/testing saat ini, menggunakan real database dengan cleanup sudah cukup baik.

## Kesimpulan

- ❌ Server **TIDAK** perlu berjalan
- ✅ Tests menggunakan database **betulan** (real)
- ✅ Data test di-cleanup setelah test selesai
- ✅ SuperTest test Express app in-process (tidak perlu HTTP server)
