import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['cash', 'bank', 'wallet']),
  balance: z.number().default(0),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  ifscCode: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: user.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return successResponse(
      { accounts, totalBalance, count: accounts.length },
      'Accounts retrieved successfully'
    );
  } catch (error) {
    console.error('Get accounts error:', error);
    return errorResponse('Failed to get accounts', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = accountSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const account = await prisma.account.create({
      data: {
        ...validation.data,
        userId: user.userId,
      },
    });

    return successResponse(account, 'Account created successfully', 201);
  } catch (error) {
    console.error('Create account error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
