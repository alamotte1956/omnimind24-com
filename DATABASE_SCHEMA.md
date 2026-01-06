# Database Schema for Authentication System

This document outlines the database schema required for the authentication system with email/password and Google OAuth support.

## Users Table

```sql
CREATE TABLE users (
  -- Primary Key
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Authentication Fields
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL, -- Nullable for OAuth-only users
  
  -- OAuth Fields
  google_id VARCHAR(255) NULL UNIQUE, -- Google user ID for OAuth users
  
  -- Profile Information
  name VARCHAR(255) NOT NULL,
  profile_picture TEXT NULL, -- URL to profile picture
  
  -- Account Status
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  
  -- Security
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP NULL,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_google_id (google_id),
  INDEX idx_is_active (is_active)
);
```

## Sessions Table (for session-based authentication)

```sql
CREATE TABLE sessions (
  -- Primary Key
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- User Reference
  user_id VARCHAR(36) NOT NULL,
  
  -- Session Data
  token VARCHAR(512) NOT NULL UNIQUE,
  refresh_token VARCHAR(512) NULL,
  device_id VARCHAR(255) NULL, -- For device fingerprinting
  
  -- Session Metadata
  ip_address VARCHAR(45) NULL, -- Supports IPv6
  user_agent TEXT NULL,
  
  -- Session Validity
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP NULL,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_active (is_active)
);
```

## Login Attempts Table (for enhanced security)

```sql
CREATE TABLE login_attempts (
  -- Primary Key
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- Attempt Information
  email VARCHAR(255) NULL, -- Can be null for failed attempts with invalid email
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,
  
  -- Attempt Details
  success BOOLEAN DEFAULT FALSE,
  failure_reason VARCHAR(255) NULL,
  
  -- Timestamps
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_email (email),
  INDEX idx_ip_address (ip_address),
  INDEX idx_attempted_at (attempted_at),
  INDEX idx_success (success)
);
```

## OAuth Providers Table (for multi-provider support)

```sql
CREATE TABLE oauth_providers (
  -- Primary Key
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- User Reference
  user_id VARCHAR(36) NOT NULL,
  
  -- Provider Information
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'github', etc.
  provider_user_id VARCHAR(255) NOT NULL,
  
  -- OAuth Tokens
  access_token TEXT NULL,
  refresh_token TEXT NULL,
  token_expires_at TIMESTAMP NULL,
  
  -- Provider Profile Data (JSON)
  profile_data JSON NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP NULL,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique Constraint
  UNIQUE KEY unique_provider_user (provider, provider_user_id),
  
  -- Indexes
  INDEX idx_user_id (user_id),
  INDEX idx_provider (provider)
);
```

## Password Reset Tokens Table

```sql
CREATE TABLE password_reset_tokens (
  -- Primary Key
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  
  -- User Reference
  user_id VARCHAR(36) NOT NULL,
  
  -- Token Information
  token VARCHAR(512) NOT NULL UNIQUE,
  
  -- Validity
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Keys
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

## Sample Migration Scripts

### PostgreSQL Migration

```sql
-- migrations/001_create_users_table.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  name VARCHAR(255) NOT NULL,
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_is_active ON users(is_active);
```

### MongoDB Schema

```javascript
// For MongoDB/Base44
const userSchema = {
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String }, // Optional for OAuth users
  google_id: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  profile_picture: { type: String },
  email_verified: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  last_login_at: { type: Date },
  failed_login_attempts: { type: Number, default: 0 },
  locked_until: { type: Date }
};

const sessionSchema = {
  user_id: { type: String, required: true, ref: 'User' },
  token: { type: String, required: true, unique: true },
  refresh_token: { type: String },
  device_id: { type: String },
  ip_address: { type: String },
  user_agent: { type: String },
  expires_at: { type: Date, required: true },
  created_at: { type: Date, default: Date.now },
  last_activity_at: { type: Date, default: Date.now },
  is_active: { type: Boolean, default: true },
  revoked_at: { type: Date }
};
```

## Base44 Entity Definitions

For Base44 platform, define entities in your Base44 project:

```javascript
// User entity
{
  name: "User",
  fields: [
    { name: "email", type: "string", required: true, unique: true },
    { name: "password_hash", type: "string" },
    { name: "google_id", type: "string", unique: true },
    { name: "name", type: "string", required: true },
    { name: "profile_picture", type: "string" },
    { name: "email_verified", type: "boolean", default: false },
    { name: "is_active", type: "boolean", default: true },
    { name: "last_login_at", type: "datetime" },
    { name: "failed_login_attempts", type: "number", default: 0 },
    { name: "locked_until", type: "datetime" }
  ]
}
```

## Security Considerations

1. **Password Storage**
   - Always use bcrypt with minimum cost factor of 10
   - Never store plain text passwords
   - Use salt rounds: `bcrypt.hash(password, 10)`

2. **Token Management**
   - Use cryptographically secure random tokens
   - Set appropriate expiration times (24 hours for access, 30 days for refresh)
   - Implement token rotation for refresh tokens

3. **Session Security**
   - Implement session timeout (30 minutes of inactivity)
   - Track device fingerprints
   - Allow users to view and revoke active sessions

4. **Rate Limiting**
   - Limit login attempts per IP (10 per 15 minutes)
   - Limit login attempts per email (5 per 15 minutes)
   - Implement account lockout after failed attempts

5. **Data Cleanup**
   - Regularly clean expired sessions (cron job)
   - Clean old login attempts (older than 30 days)
   - Clean used password reset tokens
