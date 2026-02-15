import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const transactionSchema = z.object({
  accountId: z.string().optional(),
  partyId: z.string().optional(),
  type: z.enum(['credit', 'debit', 'transfer']),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const partyId = searchParams.get('partyId');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.userId,
        ...(accountId && { accountId }),
        ...(partyId && { partyId }),
        ...(type && { type }),
        ...(startDate && endDate && {
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        }),
      },
      include: {
        account: true,
        party: true,
      },
      orderBy: { date: 'desc' },
    });

    return successResponse(
      { transactions, count: transactions.length },
      'Transactions retrieved successfully'
    );
  } catch (error) {
    console.error('Get transactions error:', error);
    return errorResponse('Failed to get transactions', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = transactionSchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    const transaction = await prisma.transaction.create({
      data: {
        ...data,
        date: new Date(data.date),
        userId: user.userId,
      },
      include: {
        account: true,
        party: true,
      },
    });

    // Update account balance
    if (data.accountId) {
      const balanceChange = data.type === 'credit' ? data.amount : -data.amount;
      await prisma.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: balanceChange,
          },
        },
      });
    }

    // Update party balance
    if (data.partyId) {
      const party = await prisma.party.findUnique({
        where: { id: data.partyId },
      });

      if (party) {
        const balanceChange = party.type === 'receive' 
          ? (data.type === 'credit' ? data.amount : -data.amount)
          : (data.type === 'credit' ? -data.amount : data.amount);

        await prisma.party.update({
          where: { id: data.partyId },
          data: {
            balance: {
              increment: balanceChange,
            },
          },
        });
      }
    }

    return successResponse(transaction, 'Transaction created successfully', 201);
  } catch (error) {
    console.error('Create transaction error:', error);
    return errorResponse('Failed to create transaction', 500);
  }
}
