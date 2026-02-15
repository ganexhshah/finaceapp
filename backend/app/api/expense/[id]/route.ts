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
    const expense = await prisma.expense.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    });

    if (!expense) {
      return errorResponse('Expense not found', 404);
    }

    // Update account balance if accountId exists
    if (expense.accountId) {
      await prisma.account.update({
        where: { id: expense.accountId },
        data: {
          balance: {
            increment: expense.amount,
          },
        },
      });
    }

    await prisma.expense.delete({
      where: { id: params.id },
    });

    return successResponse(null, 'Expense deleted successfully');
  } catch (error) {
    console.error('Delete expense error:', error);
    return errorResponse('Failed to delete expense', 500);
  }
}
