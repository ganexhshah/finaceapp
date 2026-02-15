import { NextRequest } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/response';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return errorResponse('ID token is required', 400);
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return errorResponse('Invalid token', 401);
    }

    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { settings: true },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name || 'User',
          avatar: picture,
          googleId,
          isVerified: true, // Google accounts are pre-verified
          password: '', // No password for Google auth
          settings: {
            create: {
              pushNotifications: true,
              emailNotifications: true,
              budgetAlerts: true,
              weeklyReports: false,
              biometricLogin: false,
              twoFactorAuth: false,
            },
          },
        },
        include: { settings: true },
      });
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId,
          avatar: picture || user.avatar,
          isVerified: true,
        },
        include: { settings: true },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email);

    return successResponse(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          isVerified: user.isVerified,
          settings: user.settings,
        },
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return errorResponse('Authentication failed', 500);
  }
}
