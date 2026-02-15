import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/user/login-history
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const history = await prisma.loginHistory.findMany({
      where: { userId: authResult.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return successResponse(history, 'Login history retrieved');
  } catch (error) {
    console.error('Get login history error:', error);
    return errorResponse('Failed to get login history');
  }
}
