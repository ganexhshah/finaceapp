import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import bcrypt from 'bcryptjs';

// GET /api/user/security - Get security settings
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: authResult.userId },
      select: {
        biometricLogin: true,
        twoFactorAuth: true,
      },
    });

    return successResponse(settings, 'Security settings retrieved');
  } catch (error) {
    console.error('Get security settings error:', error);
    return errorResponse('Failed to get security settings');
  }
}

// PUT /api/user/security - Update security settings
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const body = await request.json();
    const { biometricLogin, twoFactorAuth } = body;

    const settings = await prisma.userSettings.update({
      where: { userId: authResult.userId },
      data: {
        ...(biometricLogin !== undefined && { biometricLogin }),
        ...(twoFactorAuth !== undefined && { twoFactorAuth }),
      },
    });

    return successResponse(settings, 'Security settings updated');
  } catch (error) {
    console.error('Update security settings error:', error);
    return errorResponse('Failed to update security settings');
  }
}
