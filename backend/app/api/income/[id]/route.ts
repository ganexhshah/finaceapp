import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const income = await prisma.income.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!income) {
      return errorResponse('Income not found', 404);
    }

    // Update account balance if accountId exists
    if (income.accountId) {
      await prisma.account.update({
        where: { id: income.accountId },
        data: {
          balance: {
            decrement: income.amount,
          },
        },
      });
    }

    await prisma.income.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Income deleted successfully');
  } catch (error) {
    console.error('Delete income error:', error);
    return errorResponse('Failed to delete income', 500);
  }
}
