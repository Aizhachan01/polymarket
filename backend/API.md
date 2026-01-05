# API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

For authenticated endpoints, include the user ID in the request header:

```
x-user-id: <user-uuid>
```

---

## Markets

### Get All Markets

```http
GET /markets
```

Query Parameters:

- `status` (optional): Filter by status (`open` or `resolved`)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Will it rain tomorrow?",
      "description": "Weather prediction",
      "status": "open",
      "resolution": null,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "resolved_at": null,
      "updated_at": "2024-01-01T00:00:00Z",
      "creator": {
        "id": "uuid",
        "username": "admin",
        "email": "admin@example.com"
      }
    }
  ]
}
```

### Get Market by ID

```http
GET /markets/:id
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Will it rain tomorrow?",
    "status": "open",
    "pools": {
      "yes": 1000.00,
      "no": 500.00,
      "total": 1500.00
    },
    ...
  }
}
```

### Get Market Bets

```http
GET /markets/:id/bets
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "market_id": "uuid",
      "side": "YES",
      "amount": 100.0,
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "username": "user1",
        "email": "user1@example.com"
      }
    }
  ]
}
```

---

## Users

### Get Current User

```http
GET /users/me
```

Requires authentication.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user1",
    "points_balance": 1000.0,
    "role": "user",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Get User Profile

```http
GET /users/:userId
```

### Get User Bets

```http
GET /users/:userId/bets
```

Query Parameters:

- `market_id` (optional): Filter bets by market ID

---

## Bets

### Place a Bet

```http
POST /bets
```

Requires authentication.

**Request Body:**

```json
{
  "market_id": "uuid",
  "side": "YES",
  "amount": 100.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "market_id": "uuid",
    "side": "YES",
    "amount": 100.0,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Note:** If you already have a bet on the same side for the same market, the amount will be added to your existing bet.

---

## Admin Endpoints

All admin endpoints require authentication AND admin role.

### Create Market

```http
POST /admin/markets
```

**Request Body:**

```json
{
  "title": "Will Bitcoin reach $100k?",
  "description": "Optional description"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Will Bitcoin reach $100k?",
    "description": "Optional description",
    "status": "open",
    "resolution": null,
    "created_by": "uuid",
    "created_at": "2024-01-01T00:00:00Z",
    "resolved_at": null,
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Add Points to User

```http
POST /admin/users/add-points
```

**Request Body:**

```json
{
  "user_id": "uuid",
  "amount": 1000.0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "user1",
    "points_balance": 2000.0,
    "role": "user",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### Resolve Market

```http
POST /admin/markets/:id/resolve
```

**Request Body:**

```json
{
  "resolution": "YES"
}
```

This endpoint will:

1. Mark the market as resolved
2. Distribute the losing pool proportionally to winners
3. Return winners get their original bet + proportional share of losing pool

**Response:**

```json
{
  "success": true,
  "data": {
    "market": {
      "id": "uuid",
      "status": "resolved",
      "resolution": "YES",
      "resolved_at": "2024-01-01T00:00:00Z",
      ...
    },
    "distributed": true,
    "winningPool": 1000.00,
    "losingPool": 500.00,
    "totalDistributed": 500.00,
    "winnerCount": 5
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message"
}
```

Common HTTP Status Codes:

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid authentication)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (e.g., duplicate user)
- `500` - Internal Server Error
