# Password Reset Functionality Documentation

## Overview

A complete, secure password reset system has been implemented for the KetoTrack application, allowing users to safely reset their passwords via email verification. The implementation follows security best practices and includes both development and production modes.

## Architecture & Components

### 1. Database Schema

**File:** `schema.prisma`

Added a `PasswordResetToken` model to securely manage password reset requests:

```prisma
model PasswordResetToken {
  id      String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email   String
  token   String   @unique
  expires DateTime @db.Timestamp(6)
  used    Boolean  @default(false)

  @@index([email], map: "idx_password_reset_email")
  @@index([token], map: "idx_password_reset_token")
}
```

**Key Features:**

- **UUID Primary Key**: Unique identifier for each reset request
- **Email Field**: Links the token to a specific user account
- **Unique Token**: Cryptographically secure random token (64 characters hex)
- **Expiration**: 1-hour time limit for security
- **Used Flag**: Prevents token reuse after successful reset
- **Indexed Fields**: Optimized database lookups on email and token

**Database Integration:** The schema is automatically created via the initialization script `03_db-create-users-tables.sh`.

### 2. User Interface Components

#### Forgot Password Page

**File:** `app/[locale]/(auth)/forgot-password/page.tsx`

A clean, accessible form where users can request password resets:

**Features:**

- Email validation (client-side and server-side)
- Loading states and error handling
- Success messaging with security-conscious wording
- Responsive design using Mantine UI components
- Internationalization ready with Link component

**Security Considerations:**

- Always shows success message regardless of email existence (prevents email enumeration)
- Client-side validation for immediate feedback
- Disabled state during API calls to prevent spam

#### Reset Password Page

**File:** `app/[locale]/(auth)/reset-password/page.tsx`

Secure form for setting new passwords via email token:

**Features:**

- Token validation from URL parameters
- Password strength requirements (minimum 6 characters)
- Password confirmation matching
- Real-time validation feedback
- Automatic redirect to login after successful reset

**Security Measures:**

- Token expiration checking
- One-time use validation
- Secure password hashing before storage
- Clear error messaging for invalid/expired tokens

#### Updated Login Form

**File:** LoginForm.tsx

Updated the "Forgot your password?" link to point to `/forgot-password` instead of the previous `/reset-psw`.

### 3. API Endpoints

#### Password Reset Request

**File:** route.ts

Handles initial password reset requests:

```typescript
POST / api / password - reset / request;
Body: {
  email: string;
}
```

**Process Flow:**

1. **Input Validation**: Uses Zod schema for email validation
2. **User Lookup**: Checks if email exists in database
3. **Token Invalidation**: Marks any existing unused tokens as used
4. **Token Generation**: Creates cryptographically secure 32-byte hex token
5. **Database Storage**: Saves token with 1-hour expiration
6. **Email Dispatch**: Sends reset email (or logs in development)
7. **Response**: Always returns success to prevent email enumeration

**Security Features:**

- Rate limiting ready (transaction-based token invalidation)
- Prevents email enumeration attacks
- Cryptographically secure token generation
- Automatic cleanup of old tokens

#### Password Reset Confirmation

**File:** route.ts

Processes actual password changes:

```typescript
POST /api/password-reset/confirm
Body: { token: string, password: string }
```

**Process Flow:**

1. **Input Validation**: Validates token and password requirements
2. **Token Verification**: Checks token existence, expiration, and usage
3. **User Authentication**: Verifies user exists for the email
4. **Password Hashing**: Uses bcrypt with salt rounds for secure storage
5. **Atomic Update**: Database transaction ensures consistency
6. **Token Invalidation**: Marks token as used to prevent reuse

**Security Features:**

- Database transactions for atomicity
- bcrypt password hashing (industry standard)
- Token expiration enforcement
- One-time use validation

### 4. Email Service Integration

#### Email Service

**File:** email.ts

Dual-mode email system supporting both development and production:

**Development Mode:**

- Console logging with formatted output
- No external dependencies required
- Includes clickable reset links in terminal

**Production Mode:**

- Resend API integration for reliable email delivery
- Professional HTML email templates
- Error handling with fallback logging

**Email Template Features:**

- Responsive HTML design
- KetoTrack branding (🥑 logo)
- Security warnings and instructions
- One-hour expiration notice
- Fallback text links for accessibility

#### Email Template Structure:

```html
- Professional header with KetoTrack branding - Clear instructions and call-to-action button -
Security warnings about link expiration - Fallback plain text URL - Professional footer with support
information
```

### 5. Security Implementation

#### Token Security

- **Generation**: `crypto.randomBytes(32).toString('hex')` - 256-bit entropy
- **Storage**: Unique database constraint prevents collisions
- **Expiration**: 1-hour time limit automatically enforced
- **One-time Use**: Boolean flag prevents token reuse
- **Cleanup**: Old tokens automatically invalidated on new requests

#### Email Security

- **No Enumeration**: Same response regardless of email existence
- **Rate Limiting Ready**: Database structure supports easy rate limiting
- **Secure URLs**: HTTPS enforcement in production
- **Clear Expiration**: Users informed of time limits

#### Password Security

- **bcrypt Hashing**: Industry-standard password hashing
- **Salt Rounds**: Configurable salt rounds (default: 10)
- **Minimum Length**: 6-character minimum requirement
- **Confirmation**: Double-entry validation

### 6. User Experience Flow

```
1. User clicks "Forgot your password?" on login page
   ↓
2. Redirected to /forgot-password
   ↓
3. User enters email address
   ↓
4. System validates email and sends reset link
   ↓
5. User receives email with reset button/link
   ↓
6. User clicks link → redirected to /reset-password?token=xxx
   ↓
7. User enters new password (with confirmation)
   ↓
8. System validates token and updates password
   ↓
9. User redirected to login with success message
   ↓
10. User can now login with new password
```

### 7. Configuration & Environment

#### Required Environment Variables:

```bash
# Email Configuration
RESEND_API_KEY="re_your_api_key_here"              # Resend API key
EMAIL_FROM="KetoTrack <onboarding@resend.dev>"     # Sender address

# Application URLs
NEXTAUTH_URL="http://localhost:3000"                # Base URL for reset links
```

#### Development vs Production:

- **Development**: Email links logged to console, no external API calls
- **Production**: Real emails sent via Resend API

### 8. Error Handling & Logging

#### Comprehensive Error Coverage:

- Invalid email formats
- Expired or invalid tokens
- Database connection issues
- Email service failures
- Network timeouts

#### Logging Strategy:

- **Development**: Detailed console logs with email content
- **Production**: Structured logging with email delivery confirmations
- **Security**: No sensitive data in logs (tokens, passwords)

### 9. Internationalization Support

The implementation is ready for internationalization:

- All user-facing messages defined in messages.ts
- Uses `next-intl` compatible Link components
- Email templates can be easily localized

### 10. Testing & Verification

#### Development Testing:

1. Start development server: `npm run dev`
2. Navigate to `/forgot-password`
3. Enter valid email from database
4. Check console for formatted email output and reset link
5. Copy reset link and test password reset flow

#### Production Testing:

1. Configure Resend API key in environment
2. Verify domain with Resend (or use sandbox domain)
3. Test complete email delivery flow
4. Monitor logs for delivery confirmations

### 11. Future Enhancements

#### Ready for Implementation:

- **Rate Limiting**: Add Redis-based rate limiting for request endpoint
- **Email Templates**: Multiple template designs for different themes
- **Analytics**: Track reset request patterns and success rates
- **Mobile Deep Links**: App-specific reset URLs for mobile applications
- **Multi-language**: Localized email templates
- **Admin Dashboard**: View and manage reset requests
- **Two-Factor**: Optional 2FA verification for password resets

This implementation provides a production-ready, secure password reset system that follows modern security practices while maintaining excellent user experience and developer productivity.
