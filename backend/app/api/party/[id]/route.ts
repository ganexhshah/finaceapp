import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const party = await prisma.party.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!party) {
      return errorResponse('Party not found', 404);
    }

    return successResponse(party, 'Party retrieved successfully');
  } catch (error) {
    console.error('Get party error:', error);
    return errorResponse('Failed to get party', 500);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();

    const party = await prisma.party.updateMany({
      where: {
        id: params.id,
        userId: user.userId,
      },
      data: body,
    });

    if (party.count === 0) {
      return errorResponse('Party not found', 404);
    }

    return successResponse(null, 'Party updated successfully');
  } catch (error) {
    console.error('Update party error:', error);
    return errorResponse('Failed to update party', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const party = await prisma.party.deleteMany({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (party.count === 0) {
      return errorResponse('Party not found', 404);
    }

    return successResponse(null, 'Party deleted successfully');
  } catch (error) {
    console.error('Delete party error:', error);
    return errorResponse('Failed to delete party', 500);
  }
}
