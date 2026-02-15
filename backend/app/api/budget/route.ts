import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const budgetSchema = z.object({
  categoryId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string(),
  endDate: z.string(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: user.userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate spent amount for each budget
    const budgetsWithSpent = await Promise.all(
      budgets.map(async (budget) => {
        const expenses = await prisma.expense.findMany({
          where: {
            userId: user.userId,
            categoryId: budget.categoryId,
            date: {
              gte: budget.startDate,
              lte: budget.endDate,
            },
          },
        });

        const spent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const percentage = (spent / budget.amount) * 100;

        return {
          ...budget,
          spent,
          percentage: Math.round(percentage),
          remaining: budget.amount - spent,
        };
      })
    );

    return successResponse(budgetsWithSpent, 'Budgets retrieved successfully');
  } catch (error) {
    console.error('Get budgets error:', error);
    return errorResponse('Failed to get budgets', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = budgetSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    // Check if budget already exists for this category and period
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.userId,
        categoryId: data.categoryId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });

    if (existingBudget) {
      // Update existing budget
      const budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: {
          amount: data.amount,
          period: data.period,
        },
        include: {
          category: true,
        },
      });

      return successResponse(budget, 'Budget updated successfully');
    }

    // Create new budget
    const budget = await prisma.budget.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        userId: user.userId,
      },
      include: {
        category: true,
      },
    });

    return successResponse(budget, 'Budget created successfully', 201);
  } catch (error) {
    console.error('Create budget error:', error);
    return errorResponse('Failed to create budget', 500);
  }
}
