import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const expenseSchema = z.object({
  categoryId: z.string(),
  accountId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string(),
  isRecurring: z.boolean().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');

    const expenses = await prisma.expense.findMany({
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

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return successResponse(
      { expenses, total, count: expenses.length },
      'Expenses retrieved successfully'
    );
  } catch (error) {
    console.error('Get expenses error:', error);
    return errorResponse('Failed to get expenses', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = expenseSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    const expense = await prisma.expense.create({
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
            decrement: data.amount,
          },
        },
      });
    }

    return successResponse(expense, 'Expense created successfully', 201);
  } catch (error) {
    console.error('Create expense error:', error);
    return errorResponse('Failed to create expense', 500);
  }
}
