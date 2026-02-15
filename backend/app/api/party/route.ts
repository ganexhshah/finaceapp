import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const partySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional(),
  address: z.string().optional(),
  panNumber: z.string().optional(),
  type: z.enum(['receive', 'give']),
  balance: z.number().default(0),
  openingBalance: z.number().default(0),
  asOfDate: z.string(),
  avatar: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const parties = await prisma.party.findMany({
      where: {
        userId: user.userId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });

    const toReceive = parties
      .filter(p => p.type === 'receive')
      .reduce((sum, p) => sum + p.balance, 0);

    const toGive = parties
      .filter(p => p.type === 'give')
      .reduce((sum, p) => sum + p.balance, 0);

    return successResponse(
      {
        parties,
        summary: {
          toReceive,
          toGive,
          count: parties.length,
        },
      },
      'Parties retrieved successfully'
    );
  } catch (error) {
    console.error('Get parties error:', error);
    return errorResponse('Failed to get parties', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = partySchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const data = validation.data;

    const party = await prisma.party.create({
      data: {
        ...data,
        asOfDate: new Date(data.asOfDate),
        userId: user.userId,
      },
    });

    return successResponse(party, 'Party created successfully', 201);
  } catch (error) {
    console.error('Create party error:', error);
    return errorResponse('Failed to create party', 500);
  }
}
