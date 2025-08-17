# Authorize.net Payment API

A simple backend API for processing payments with Authorize.net. Built with Next.js API routes.

## Features

- Process payments through Authorize.net
- No authentication required - all endpoints are public
- SQLite database for storing transaction records
- TypeScript for type safety

## API Endpoints

### Process Payment

- **POST** `/api/payment/process`
- Process a new payment through Authorize.net
- Request body:

```json
{
  "amount": number,
  "cardNumber": string,
  "expirationMonth": string,
  "expirationYear": string,
  "cvv": string,
  "billingInfo": {
    "firstName": string,
    "lastName": string,
    "address": string,
    "city": string,
    "state": string,
    "zip": string
  }
}
```

- Response:

```json
{
  "transactionId": string,
  "status": "success" | "failed",
  "message": string
}
```

### Get Transaction Status

- **GET** `/api/payment/transaction/:id`
- Check the status of a transaction
- Response:

```json
{
  "transactionId": string,
  "status": "success" | "failed",
  "amount": number,
  "cardLast4": string,
  "errorMessage": string | null,
  "createdAt": string
}
```

## Getting Started

1. Clone the repository

2. Copy .env.example to .env and fill in your Authorize.net credentials:

```env
AUTHORIZE_NET_API_LOGIN_ID=your_login_id
AUTHORIZE_NET_TRANSACTION_KEY=your_transaction_key
AUTHORIZE_NET_ENVIRONMENT=SANDBOX # or PRODUCTION
```

3. Install dependencies:

```bash
bun install
```

4. Initialize the database:

```bash
bunx prisma db push
```

5. Start the development server:

```bash
bun dev
```

## Environment Variables

- `AUTHORIZE_NET_API_LOGIN_ID`: Your Authorize.net API Login ID
- `AUTHORIZE_NET_TRANSACTION_KEY`: Your Authorize.net Transaction Key
- `AUTHORIZE_NET_ENVIRONMENT`: Environment to use (SANDBOX or PRODUCTION)

## Database Schema

The project uses SQLite with Prisma ORM. Here's the main schema for transactions:

```prisma
model Transaction {
  id            String      @id @default(cuid())
  amount        Float
  status        String
  transactionId String      @unique
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
}
```

## Error Handling

All API endpoints return standard error responses:

```json
{
  "error": "Error message here",
  "status": 400 // HTTP status code
}
```
