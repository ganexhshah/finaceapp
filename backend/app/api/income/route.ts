import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const incomeSchema = z.object({
  categoryId: z.string(),
  accountId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string(),
  isRecurring: z.boolean().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');

    const incomes = await prisma.income.findMany({
      where: {
        userId: user.userId,
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });

    const total = incomes.reduce((sum, income) => sum + income.amount, 0);

    return successResponse(
      { incomes, total, count: incomes.length },
      'Incomes retrieved successfully'
    );
  } catch (error) {
    console.error('Get incomes error:', error);
    return errorResponse('Failed to get incomes', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = incomeSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    const income = await prisma.income.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: user.userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Update account balance if accountId provided
    if (data.accountId) {
      await prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: data.amount,
          },
        },
      });
    }

    return successResponse(income, 'Income created successfully', 201);
  } catch (error) {
    console.error('Create income error:', error);
    return errorResponse('Failed to create income', 500);
  }
}
