# Polymarket Backend API

A Web2 backend for a Polymarket-style prediction market application built with Node.js, Express, and Supabase.

## Features

- **User Management**: Users have point balances and can place bets
- **Market Management**: Admins can create prediction markets
- **Betting System**: Users can bet YES or NO on markets
- **Automatic Resolution**: When markets are resolved, winnings are distributed proportionally to winners

## Architecture

### Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Supabase client configuration
│   ├── controllers/
│   │   ├── userController.js    # User endpoints logic
│   │   ├── marketController.js  # Market endpoints logic
│   │   ├── betController.js     # Bet endpoints logic
│   │   └── adminController.js   # Admin endpoints logic
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   └── admin.js             # Admin authorization middleware
│   ├── routes/
│   │   ├── users.js             # User routes
│   │   ├── markets.js           # Market routes
│   │   ├── bets.js              # Bet routes
│   │   └── admin.js             # Admin routes
│   ├── services/
│   │   ├── userService.js       # User business logic
│   │   ├── marketService.js     # Market business logic
│   │   ├── betService.js        # Bet business logic
│   │   └── resolutionService.js # Market resolution logic
│   ├── utils/
│   │   └── errors.js            # Error handling utilities
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
├── migrations/
│   └── 001_initial_schema.sql   # Database schema
└── package.json
```

### Database Schema

**users**

- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `username` (String, Unique)
- `points_balance` (Decimal)
- `role` (Enum: 'user', 'admin')
- `created_at`, `updated_at`

**markets**

- `id` (UUID, Primary Key)
- `title` (String)
- `description` (Text)
- `status` (Enum: 'open', 'resolved')
- `resolution` (Enum: 'YES', 'NO', Null)
- `created_by` (UUID, Foreign Key → users.id)
- `created_at`, `resolved_at`, `updated_at`

**bets**

- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key → users.id)
- `market_id` (UUID, Foreign Key → markets.id)
- `side` (Enum: 'YES', 'NO')
- `amount` (Decimal)
- `created_at`
- Unique constraint: (user_id, market_id, side)

### Resolution Logic

When a market is resolved:

1. Market status changes to 'resolved' with the winning side
2. All bets on the losing side form the "losing pool"
3. The losing pool is distributed proportionally to winners
4. Each winner receives: `(their_bet / winning_pool_total) × losing_pool_total + their_original_bet`

Example:

- Market resolves to YES
- YES pool: 1000 points (from 5 users)
- NO pool: 500 points (losing pool)
- User A bet 200 on YES → receives: (200/1000) × 500 + 200 = 300 points

## Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   The `.env` file is already created with your Supabase credentials from MCP:

   ```
   SUPABASE_URL=https://lbndjqzeewbrwxkizkwj.supabase.co
   SUPABASE_ANON_KEY=your_anon_key
   PORT=3000
   NODE_ENV=development
   ```

3. **Database migrations:**
   ✅ Database schema and RLS policies have been applied via MCP.
   The migrations are already in your Supabase database.

4. **Start the server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

## API Endpoints

### Authentication

All endpoints requiring authentication expect an `x-user-id` header with the user's UUID.

### Public Endpoints

**Markets**

- `GET /api/markets` - Get all markets
- `GET /api/markets/:id` - Get market details with pools
- `GET /api/markets/:id/bets` - Get all bets for a market

**Users**

- `GET /api/users/:userId` - Get user profile

### Authenticated Endpoints (Users)

**User**

- `GET /api/users/me` - Get current user profile
- `GET /api/users/:userId/bets` - Get user's bets

**Bets**

- `POST /api/bets` - Place a bet
  ```json
  {
    "market_id": "uuid",
    "side": "YES" | "NO",
    "amount": 100.00
  }
  ```

### Admin Endpoints (Require Admin Role)

**Markets**

- `POST /api/admin/markets` - Create a new market
  ```json
  {
    "title": "Market title",
    "description": "Optional description"
  }
  ```
- `POST /api/admin/markets/:id/resolve` - Resolve a market
  ```json
  {
    "resolution": "YES" | "NO"
  }
  ```

**Users**

- `POST /api/admin/users/add-points` - Add points to user
  ```json
  {
    "user_id": "uuid",
    "amount": 1000.0
  }
  ```

## Authentication

Currently uses a simple header-based authentication:

- Header: `x-user-id: <user-uuid>`

For production, you should implement proper JWT authentication or session management.

## Response Format

All responses follow this format:

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Development Notes

- The codebase uses ES6 modules (`type: "module"` in package.json)
- Supabase client uses anon key with RLS enabled
- RLS policies are implemented for all tables
- Authorization is handled at application level (header-based auth: `x-user-id`)
- Error handling uses custom `AppError` class
- Services handle all business logic
- Controllers handle HTTP request/response
- Routes define endpoint structure

## Row Level Security (RLS)

RLS is enabled on all tables with the following policies:

- **Users**: Public read, allow insert/update (authorization in app layer)
- **Markets**: Public read, allow insert/update (admin check in app layer)
- **Bets**: Public read, allow insert (user ownership checked in app layer)

**Note**: Since we're using header-based authentication (`x-user-id`) instead of Supabase Auth JWT tokens, RLS policies are more permissive. Authorization (who can do what) is primarily handled in the application layer through middleware. For production with full RLS benefits, consider migrating to Supabase Auth with JWT tokens.
