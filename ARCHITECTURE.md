# Backend Architecture Overview

## Design Decisions

### 1. **Folder Structure (MVC + Services Pattern)**

- **Separation of Concerns**: Controllers handle HTTP, services handle business logic
- **Scalability**: Easy to add new features without affecting existing code
- **Testability**: Services can be tested independently from HTTP layer

### 2. **Database Schema Design**

**Users Table**

- Points stored as `DECIMAL(15, 2)` for precision (no floating point errors)
- Role-based access control (admin/user)
- Balance constraint ensures it can't go negative

**Markets Table**

- Status enum (`open`/`resolved`) prevents invalid state transitions
- Resolution can be NULL until market is resolved
- Foreign key to users for creator tracking

**Bets Table**

- Unique constraint `(user_id, market_id, side)` allows users to:
  - Place multiple bets on the same side (amounts are combined)
  - Place bets on BOTH sides (hedging)
- Amount stored as DECIMAL for precision
- Foreign keys ensure data integrity

**Indexes**

- Added indexes on frequently queried fields (status, user_id, market_id)
- Composite index on (market_id, side) for pool calculations

### 3. **Resolution Logic**

**Proportional Distribution**

- Losing pool = sum of all bets on losing side
- Winning pool = sum of all bets on winning side
- Each winner gets: `(their_bet / winning_pool_total) × losing_pool + their_original_bet`

**Example:**

- Market: "Will it rain?"
- Resolution: YES
- YES pool: 1000 points (5 users)
- NO pool: 500 points (3 users)
- User A bet 200 on YES
- User A receives: (200/1000) × 500 + 200 = 300 points

**Edge Cases Handled:**

- No winners: All bets stay with the house
- No losers: Winners get their original bets back

### 4. **Service Layer**

**Why Services?**

- Reusable business logic
- Single source of truth for business rules
- Easier to test and maintain
- Can be used by controllers, scheduled jobs, or other services

**Service Responsibilities:**

- `userService`: User CRUD, balance management
- `marketService`: Market CRUD, resolution status
- `betService`: Bet placement, retrieval, pool calculations
- `resolutionService`: Orchestrates resolution and distribution

### 5. **Authentication & Authorization**

**Current Implementation:**

- Simple header-based auth (`x-user-id`)
- Suitable for development/demo
- **For Production**: Should implement JWT or session-based auth

**Authorization:**

- Middleware chain: `authenticate` → `requireAdmin`
- Admin-only routes protected at route level

### 6. **Error Handling**

**Custom Error Class:**

- `AppError` with status codes
- Operational errors vs programming errors
- Centralized error handler middleware

### 7. **API Design**

**RESTful Principles:**

- Resource-based URLs (`/markets`, `/bets`)
- HTTP methods map to operations (GET, POST)
- Consistent response format

**Endpoint Organization:**

- Public endpoints: Markets (read-only)
- User endpoints: Authenticated user operations
- Admin endpoints: Separate `/admin` prefix

### 8. **Database Choice: Supabase**

**Why Supabase?**

- PostgreSQL (robust, ACID compliant)
- Real-time capabilities (future enhancement)
- Built-in authentication (can integrate later)
- Easy migrations via SQL editor

**Current Setup:**

- Using service role key (bypasses RLS)
- No RLS policies (as requested)
- Can add RLS later for multi-tenant security

## Data Flow Examples

### Placing a Bet

1. User sends POST `/api/bets` with market_id, side, amount
2. `betController.createBet` validates request
3. `betService.placeBet`:
   - Validates user balance
   - Validates market is open
   - Creates/updates bet record
   - Deducts points from user balance
4. Returns bet record

### Resolving a Market

1. Admin sends POST `/api/admin/markets/:id/resolve`
2. `adminController.resolveMarketHandler` validates request
3. `resolutionService.resolveMarketAndDistribute`:
   - Marks market as resolved
   - Gets all bets and pools
   - Calculates winnings for each winner
   - Updates user balances
4. Returns resolution summary

## Future Enhancements (Not Implemented)

1. **Authentication**

   - JWT tokens
   - Password hashing
   - Session management

2. **Security**

   - Rate limiting
   - Input validation/sanitization
   - SQL injection protection (Supabase handles this)
   - CORS configuration

3. **Features**

   - Market closing dates
   - Bet limits
   - Transaction history
   - Market categories/tags
   - Search and filtering

4. **Performance**

   - Caching (Redis)
   - Database connection pooling
   - Query optimization
   - Pagination

5. **Monitoring**
   - Logging (Winston)
   - Error tracking (Sentry)
   - Metrics (Prometheus)
