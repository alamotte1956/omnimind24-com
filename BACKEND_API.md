# Backend API Documentation

This document describes the backend API endpoints required by the OmniMind24 frontend application.

## Base URL

All API endpoints should be available at:
```
http://localhost:3000/api
```

Configure via environment variable: `VITE_API_BASE_URL`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "access_level": "user",
    "costar_completed": true
  }
}
```

#### POST /api/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "access_level": "user",
    "costar_completed": false
  }
}
```

#### GET /api/auth/me
Get current authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "access_level": "user",
  "costar_completed": true,
  "created_date": "2024-01-01T00:00:00Z"
}
```

#### POST /api/auth/refresh
Refresh JWT token.

**Request:**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response:**
```json
{
  "token": "new_token_here"
}
```

## Entity Endpoints

All entity endpoints follow a consistent pattern. Replace `{entity}` with the entity name (lowercase, hyphenated).

### Supported Entities

- `users`
- `documents`
- `conversations`
- `credits`
- `orders`
- `apikeys`
- `subscriptions`
- `costar-profiles`
- `model-preferences`
- `model-benchmarks`
- `action-items`
- `content-orders`
- `credit-transactions`
- `auto-purchases`
- `content-ideas`
- `content-shares`
- `content-comments`
- `content-folders`
- `referrals`
- `user-templates`
- `template-reviews`
- `roles`
- `content-performance`
- `seo-analysis`
- `fine-tuned-models`
- `model-performance-logs`
- `file-exports`
- `model-favorites`

### GET /api/{entity}
List entities with optional filtering and sorting.

**Query Parameters:**
- `sort` - Sort order (e.g., `-created_date` for descending)
- `limit` - Maximum number of results
- `offset` - Number of results to skip
- `filter` - JSON-encoded filter object

**Example:**
```
GET /api/content-orders?sort=-created_date&limit=10
```

**Response:**
```json
[
  {
    "id": "1",
    "title": "Order 1",
    "status": "completed",
    "created_date": "2024-01-01T00:00:00Z"
  }
]
```

### GET /api/{entity}/:id
Get a single entity by ID.

**Response:**
```json
{
  "id": "1",
  "title": "Order 1",
  "status": "completed",
  "created_date": "2024-01-01T00:00:00Z"
}
```

### POST /api/{entity}
Create a new entity.

**Request:**
```json
{
  "title": "New Order",
  "status": "pending"
}
```

**Response:**
```json
{
  "id": "2",
  "title": "New Order",
  "status": "pending",
  "created_date": "2024-01-02T00:00:00Z"
}
```

### PUT /api/{entity}/:id
Update an entity (full update).

**Request:**
```json
{
  "title": "Updated Order",
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "1",
  "title": "Updated Order",
  "status": "completed",
  "updated_date": "2024-01-02T00:00:00Z"
}
```

### PATCH /api/{entity}/:id
Partially update an entity.

**Request:**
```json
{
  "status": "completed"
}
```

**Response:**
```json
{
  "id": "1",
  "title": "Order 1",
  "status": "completed",
  "updated_date": "2024-01-02T00:00:00Z"
}
```

### DELETE /api/{entity}/:id
Delete an entity.

**Response:**
```
204 No Content
```

## Function Endpoints

Backend functions are invoked via a generic endpoint.

### POST /api/functions/:name
Invoke a backend function.

**Request:**
```json
{
  "param1": "value1",
  "param2": "value2"
}
```

**Response:**
```json
{
  "data": {
    "result": "function result"
  }
}
```

### Supported Functions

- `chatWithLLM` - Chat with LLM
- `updateModelBenchmarks` - Update model benchmarks
- `selectOptimalModel` - Select optimal model
- `syncSalesforceTasks` - Sync Salesforce tasks
- `syncRealTimeBenchmarks` - Sync real-time benchmarks
- `processOrder` - Process order
- `createPaymentIntent` - Create Stripe payment intent
- `stripeWebhook` - Handle Stripe webhook
- `triggerAutoPurchase` - Trigger auto purchase
- `generateContentIdeas` - Generate content ideas
- `uploadToS3` - Upload file to S3
- `redeemReferral` - Redeem referral
- `sendResendEmail` - Send email via Resend
- `resetOnboarding` - Reset onboarding
- `analyzeSEO` - Analyze SEO
- `startFineTuning` - Start fine-tuning
- `makeStaff` - Make user staff
- `makeAdmin` - Make user admin
- `testElevenlabs` - Test ElevenLabs
- `testTavily` - Test Tavily
- `testStripe` - Test Stripe
- `exportContent` - Export content
- `exportAudio` - Export audio
- `generateSalesSheet` - Generate sales sheet
- `generateTechnicalSheet` - Generate technical sheet
- `supportChatbot` - Support chatbot
- `verifyCheckoutSession` - Verify Stripe checkout session
- `completeTestOrder` - Complete test order
- `completeOrder` - Complete order
- `refundOrder` - Refund order
- `cleanupStuckOrders` - Cleanup stuck orders
- `rateLimitCheck` - Rate limit check

## Integration Endpoints

### POST /api/integrations/llm
Invoke LLM (OpenAI, Anthropic, Google).

**Request:**
```json
{
  "provider": "openai",
  "model": "gpt-4",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7
}
```

**Response:**
```json
{
  "response": "I'm doing well, thank you!",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

### POST /api/integrations/email
Send email via SendGrid.

**Request:**
```json
{
  "to": "user@example.com",
  "subject": "Welcome to OmniMind24",
  "html": "<h1>Welcome!</h1>",
  "text": "Welcome!"
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "abc123"
}
```

### POST /api/integrations/upload
Upload file to S3.

**Request (multipart/form-data):**
```
file: <binary data>
folder: "uploads"
```

**Response:**
```json
{
  "url": "https://bucket.s3.amazonaws.com/uploads/file.pdf",
  "key": "uploads/file.pdf",
  "size": 1024
}
```

### POST /api/integrations/image
Generate image with DALL-E.

**Request:**
```json
{
  "prompt": "A beautiful sunset over the ocean",
  "size": "1024x1024",
  "n": 1
}
```

**Response:**
```json
{
  "images": [
    {
      "url": "https://...generated-image.png"
    }
  ]
}
```

### POST /api/integrations/extract
Extract data from uploaded file.

**Request:**
```json
{
  "fileUrl": "https://bucket.s3.amazonaws.com/file.pdf",
  "extractionType": "text"
}
```

**Response:**
```json
{
  "text": "Extracted text content...",
  "metadata": {
    "pages": 10,
    "words": 5000
  }
}
```

### POST /api/integrations/signed-url
Create signed URL for file access.

**Request:**
```json
{
  "key": "uploads/file.pdf",
  "expiresIn": 3600
}
```

**Response:**
```json
{
  "url": "https://bucket.s3.amazonaws.com/uploads/file.pdf?signature=...",
  "expiresAt": "2024-01-01T01:00:00Z"
}
```

### POST /api/integrations/private-upload
Upload private file with access control.

**Request (multipart/form-data):**
```
file: <binary data>
folder: "private"
userId: "123"
```

**Response:**
```json
{
  "key": "private/123/file.pdf",
  "size": 1024
}
```

## Error Handling

All endpoints should return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid parameters",
  "details": {
    "field": "email",
    "issue": "Email is required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "You don't have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## CORS Configuration

Enable CORS for your frontend domain:

```javascript
// Example Express.js configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Rate Limiting

Implement rate limiting to prevent abuse:

```javascript
// Example rate limit: 100 requests per 15 minutes
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

## Security Best Practices

1. **JWT Tokens**: Use strong secret keys, set appropriate expiration times
2. **Password Hashing**: Use bcrypt with appropriate salt rounds
3. **Input Validation**: Validate all inputs before processing
4. **SQL Injection**: Use parameterized queries
5. **XSS Protection**: Sanitize outputs, set appropriate headers
6. **HTTPS**: Always use HTTPS in production
7. **Environment Variables**: Never commit secrets to version control

## Database Schema

See entity definitions in the frontend code for expected fields:
- `src/api/entities.js` - Entity list
- Individual page files for specific entity usage

## Testing

Provide a health check endpoint:

### GET /api/health
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

## Implementation Checklist

- [ ] Set up Express.js or similar backend framework
- [ ] Implement JWT authentication
- [ ] Create database models for all entities
- [ ] Implement CRUD endpoints for entities
- [ ] Implement function endpoints
- [ ] Set up third-party integrations (OpenAI, SendGrid, S3)
- [ ] Configure CORS
- [ ] Add rate limiting
- [ ] Implement error handling
- [ ] Add logging and monitoring
- [ ] Write API tests
- [ ] Deploy to production

## Example Backend Stack

**Recommended:**
- Node.js + Express.js
- PostgreSQL or MongoDB
- JWT for authentication
- Winston for logging
- Jest for testing

**Alternative:**
- Python + FastAPI
- Django + DRF
- Ruby on Rails
- Go + Gin

---

For questions or clarification, refer to the frontend code or contact the development team.
