import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().min(1, 'Icon is required'),
  type: z.enum(['income', 'expense']),
});

export async function GET(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const categories = await prisma.category.findMany({
      where: {
        userId: user.userId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'asc' },
    });

    return successResponse(categories, 'Categories retrieved successfully');
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse('Failed to get categories', 500);
  }
}

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const validation = categorySchema.safeParse(body);
    
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const category = await prisma.category.create({
      data: {
        ...validation.data,
        userId: user.userId,
      },
    });

    return successResponse(category, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse('Failed to create category', 500);
  }
}
