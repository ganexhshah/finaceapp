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
    const account = await prisma.account.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!account) {
      return errorResponse('Account not found', 404);
    }

    // Get recent transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: params.id,
        userId: user.userId,
      },
      orderBy: { date: 'desc' },
      take: 20,
    });

    return successResponse(
      { account, transactions },
      'Account retrieved successfully'
    );
  } catch (error) {
    console.error('Get account error:', error);
    return errorResponse('Failed to get account', 500);
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

    const account = await prisma.account.updateMany({
      where: {
        id: params.id,
        userId: user.userId,
      },
      data: body,
    });

    if (account.count === 0) {
      return errorResponse('Account not found', 404);
    }

    return successResponse(null, 'Account updated successfully');
  } catch (error) {
    console.error('Update account error:', error);
    return errorResponse('Failed to update account', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const account = await prisma.account.deleteMany({
      where: {
        id: params.id,
        userId: user.userId,
        isDefault: false, // Prevent deleting default account
      },
    });

    if (account.count === 0) {
      return errorResponse('Account not found or cannot be deleted', 404);
    }

    return successResponse(null, 'Account deleted successfully');
  } catch (error) {
    console.error('Delete account error:', error);
    return errorResponse('Failed to delete account', 500);
  }
}
