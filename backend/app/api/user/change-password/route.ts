import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';
import bcrypt from 'bcryptjs';

// POST /api/user/change-password
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return errorResponse('Current password and new password are required', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse('New password must be at least 6 characters', 400);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Check if user has Google login (no password)
    if (user.googleId && !user.password) {
      return errorResponse('Cannot change password for Google login accounts', 400);
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return errorResponse('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: authResult.userId },
      data: { password: hashedPassword },
    });

    return successResponse('Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return errorResponse('Failed to change password');
  }
}
