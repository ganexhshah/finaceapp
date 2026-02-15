import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.userId },
    });

    return successResponse(settings, 'Settings retrieved successfully');
  } catch (error) {
    console.error('Get settings error:', error);
    return errorResponse('Failed to get settings', 500);
  }
}

export async function PUT(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.userId },
      update: body,
      create: {
        userId: user.userId,
        ...body,
      },
    });

    return successResponse(settings, 'Settings updated successfully');
  } catch (error) {
    console.error('Update settings error:', error);
    return errorResponse('Failed to update settings', 500);
  }
}
