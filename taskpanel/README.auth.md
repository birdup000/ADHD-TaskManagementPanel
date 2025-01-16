# JWT Authentication Implementation

This implementation adds JWT-based authentication to the Task Panel application. Here's what has been implemented:

1. **JWT Configuration** (`jwt-config.ts`)
   - Configurable JWT secret via environment variable
   - Token expiration set to 24 hours by default

2. **Authentication Types** (`auth-types.ts`)
   - Added JWTPayload interface for type-safe token handling
   - Existing User and AuthResponse interfaces

3. **Authentication Service** (`auth-service.ts`)
   - JWT token generation on login
   - Token verification function
   - User registration and login functionality

4. **Middleware** (`middleware.ts`)
   - Protects API routes with JWT verification
   - Excludes auth endpoints from verification
   - Returns appropriate error responses for unauthorized requests

## Usage

1. Set the JWT_SECRET environment variable (optional, has default)
2. Register a user using the auth service
3. Login to receive a JWT token
4. Include the token in the Authorization header for API requests:
   ```
   Authorization: Bearer your-jwt-token
   ```

## Security Notes

- JWT secret should be properly configured in production
- Tokens expire after 24 hours
- All API routes (except auth endpoints) are protected
- Passwords should be properly hashed before storage (currently stored as received)