import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const userProfile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!userProfile) {
      return errorResponse('User not found', 404);
    }

    return successResponse(userProfile, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse('Failed to get profile', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, phone, dateOfBirth, avatar } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        avatar: true,
      },
    });

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse('Failed to update profile', 500);
  }
}
