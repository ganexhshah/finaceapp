# Finance Tracker Backend API

Backend API for the Finance Tracker mobile application built with Next.js, Prisma, and PostgreSQL.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT
- **Email**: Nodemailer (Gmail)
- **File Upload**: Cloudinary
- **Validation**: Zod
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (Neon)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your actual credentials.

3. Generate Prisma Client:
```bash
npm run prisma:generate
```

4. Push database schema:
```bash
npm run prisma:push
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Email (Gmail)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="App Name <your-email@gmail.com>"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# App
NEXT_PUBLIC_API_URL="http://localhost:3001"
NODE_ENV="development"
```

## Running the Server

### Development
```bash
npm run dev
```
Server runs on http://localhost:3001

### Production
```bash
npm run build
npm start
```

## Database Management

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

### Push Schema Changes
```bash
npm run prisma:push
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

## API Endpoints

### Authentication

#### POST /api/auth/signup
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Account created successfully. Please check your email for OTP.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "..."
    }
  }
}
```

#### POST /api/auth/verify-otp
Verify email with OTP
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST /api/auth/resend-otp
Resend OTP
```json
{
  "email": "john@example.com"
}
```

#### POST /api/auth/login
Login user
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "jwt-token-here"
  }
}
```

### Protected Routes

All protected routes require Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Database Schema

### Models

- **User**: User accounts
- **UserSettings**: User preferences
- **Category**: Income/Expense categories
- **Income**: Income records
- **Expense**: Expense records
- **Budget**: Budget allocations
- **Account**: Cash/Bank/Wallet accounts
- **Party**: Receivables/Payables parties
- **Transaction**: Account transactions
- **OTP**: Email verification codes

See `prisma/schema.prisma` for complete schema.

## Email Templates

### OTP Email
Sent during signup and OTP resend with:
- 6-digit OTP code
- 10-minute expiration
- Professional HTML template

### Welcome Email
Sent after email verification with:
- Welcome message
- Feature highlights
- Getting started guide

## File Upload (Cloudinary)

### Upload Image
```typescript
import { uploadImage } from '@/lib/cloudinary';

const result = await uploadImage(base64Image, 'folder-name');
// Returns: { success, url, publicId }
```

### Delete Image
```typescript
import { deleteImage } from '@/lib/cloudinary';

const result = await deleteImage(publicId);
// Returns: { success, result }
```

## Error Handling

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Validation Error
- 500: Server Error

## Security

### Password Hashing
- Uses bcryptjs with 10 salt rounds
- Passwords never stored in plain text

### JWT Tokens
- Signed with secret key
- 7-day expiration (configurable)
- Includes userId and email

### Email Verification
- OTP-based verification
- 10-minute expiration
- One-time use only

## Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate App Password:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the 16-character password in EMAIL_PASSWORD

## Cloudinary Setup

1. Create account at cloudinary.com
2. Get credentials from Dashboard
3. Add to .env file
4. Images uploaded to specified folders

## Project Structure

```
backend/
├── app/
│   └── api/
│       └── auth/
│           ├── signup/route.ts
│           ├── login/route.ts
│           ├── verify-otp/route.ts
│           └── resend-otp/route.ts
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # Auth utilities
│   ├── email.ts           # Email service
│   ├── cloudinary.ts      # Image upload
│   └── response.ts        # Response helpers
├── prisma/
│   └── schema.prisma      # Database schema
├── .env                   # Environment variables
├── .env.example           # Example env file
├── package.json
├── tsconfig.json
├── next.config.js
└── README.md
```

## Development Guidelines

### Adding New API Routes

1. Create route file in `app/api/[route]/route.ts`
2. Use Zod for validation
3. Use response helpers from `lib/response.ts`
4. Handle errors properly
5. Add authentication if needed

Example:
```typescript
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/response';
import { getUserFromRequest } from '@/lib/auth';

const schema = z.object({
  // validation schema
});

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = getUserFromRequest(request);
    if (!user) {
      return errorResponse('Unauthorized', 401);
    }

    // Parse and validate
    const body = await request.json();
    const validation = schema.safeParse(body);
    
    if (!validation.success) {
      return errorResponse('Validation failed', 422, validation.error.errors);
    }

    // Your logic here
    
    return successResponse(data, 'Success message');
  } catch (error) {
    console.error('Error:', error);
    return errorResponse('Internal server error', 500);
  }
}
```

## Testing

### Test Email Sending
```bash
# Send test OTP
curl -X POST http://localhost:3001/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Authentication
```bash
# Signup
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Railway
- Render
- Heroku
- DigitalOcean App Platform

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify Neon database is active
- Check SSL settings

### Email Not Sending
- Verify Gmail App Password
- Check EMAIL_USER and EMAIL_PASSWORD
- Enable "Less secure app access" if needed

### Cloudinary Upload Fails
- Verify API credentials
- Check file size limits
- Ensure proper base64 encoding

## Support

For issues and questions:
- Check documentation
- Review error logs
- Contact support

## License

MIT

---

**Version**: 1.0.0  
**Last Updated**: February 2026
