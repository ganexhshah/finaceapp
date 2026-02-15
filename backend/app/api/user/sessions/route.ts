import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/user/sessions
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: authResult.userId,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(sessions, 'Active sessions retrieved');
  } catch (error) {
    console.error('Get sessions error:', error);
    return errorResponse('Failed to get sessions');
  }
}

// DELETE /api/user/sessions - Revoke a session
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return errorResponse('Session ID is required', 400);
    }

    // Delete the session
    await prisma.session.delete({
      where: {
        id: sessionId,
        userId: authResult.userId,
      },
    });

    return successResponse('Session revoked successfully');
  } catch (error) {
    console.error('Delete session error:', error);
    return errorResponse('Failed to revoke session');
  }
}
