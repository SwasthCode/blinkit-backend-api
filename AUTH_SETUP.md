# Authentication Setup Guide

## Overview
This API now includes JWT-based authentication with the following features:
- JWT token generation with 7-day expiry
- Token contains user email, role, _id, and status
- Centralized login through auth resource
- Protected routes using JWT guards

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=base-api

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Configuration
PORT=3000
```

## API Endpoints

### Authentication Endpoints

#### POST /auth/login
Login endpoint that returns JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Protected Endpoints

#### GET /users/profile
Get current user profile (requires JWT token in Authorization header).

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "first_name": "John",
    "last_name": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## User Schema Updates

The user schema now includes:
- `role`: enum ['admin', 'user', 'moderator'] (default: 'user')
- `status`: enum ['active', 'inactive', 'suspended'] (default: 'active')

## JWT Token Structure

The JWT token contains:
- `sub`: User ID
- `email`: User email
- `role`: User role
- `status`: User status
- `exp`: Expiration time (7 days from creation)
- `iat`: Issued at time

## Usage Examples

### 1. Create a User
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "SecurePassword123!",
    "role": "user",
    "status": "active"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

### 3. Access Protected Route
```bash
curl -X GET http://localhost:3000/users/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Security Features

1. **Password Encryption**: Passwords are encrypted using the existing PasswordUtil
2. **JWT Expiry**: Tokens expire after 7 days
3. **Status Validation**: Only active users can login
4. **Role-based Access**: User roles are included in the token for future authorization
5. **Bearer Token Authentication**: Standard Authorization header format

## Testing

1. Start the application: `npm run start:dev`
2. Create a user using the `/users` endpoint
3. Login using the `/auth/login` endpoint
4. Use the returned token to access protected routes like `/users/profile`
