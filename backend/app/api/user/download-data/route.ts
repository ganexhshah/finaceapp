import { NextRequest } from 'next/server';
import { authenticateToken } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/response';

// GET /api/user/download-data
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateToken(request);
    if (!authResult.success || !authResult.userId) {
      return errorResponse(authResult.message, 401);
    }

    // Fetch all user data
    const [user, incomes, expenses, accounts, parties, budgets, categories, transactions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: authResult.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          dateOfBirth: true,
          avatar: true,
          createdAt: true,
        },
      }),
      prisma.income.findMany({
        where: { userId: authResult.userId },
        include: { category: true, account: true },
      }),
      prisma.expense.findMany({
        where: { userId: authResult.userId },
        include: { category: true, account: true },
      }),
      prisma.account.findMany({
        where: { userId: authResult.userId },
      }),
      prisma.party.findMany({
        where: { userId: authResult.userId },
      }),
      prisma.budget.findMany({
        where: { userId: authResult.userId },
        include: { category: true },
      }),
      prisma.category.findMany({
        where: { userId: authResult.userId },
      }),
      prisma.transaction.findMany({
        where: { userId: authResult.userId },
        include: { account: true, party: true },
      }),
    ]);

    const data = {
      user,
      incomes,
      expenses,
      accounts,
      parties,
      budgets,
      categories,
      transactions,
      exportedAt: new Date().toISOString(),
    };

    return successResponse(data, 'Data exported successfully');
  } catch (error) {
    console.error('Download data error:', error);
    return errorResponse('Failed to export data');
  }
}
