import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import bcrypt from 'bcryptjs';

// POST /api/user/delete-account
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const body = await request.json();
    const { password, confirmation } = body;

    if (confirmation !== 'DELETE') {
      return errorResponse('Please type DELETE to confirm', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Verify password if not Google login
    if (!user.googleId && user.password) {
      if (!password) {
        return errorResponse('Password is required', 400);
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return errorResponse('Incorrect password', 400);
      }
    }

    // Delete user (cascade will delete all related data)
    await prisma.user.delete({
      where: { id: authResult.userId },
    });

    return successResponse('Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    return errorResponse('Failed to delete account');
  }
}
