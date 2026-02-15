import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/middleware';
import { successResponse, errorResponse } from '@/lib/response';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { name, icon } = body;

    const category = await prisma.category.updateMany({
      where: {
        id: params.id,
        userId: user.userId,
      },
      data: {
        ...(name && { name }),
        ...(icon && { icon }),
      },
    });

    if (category.count === 0) {
      return errorResponse('Category not found', 404);
    }

    return successResponse(null, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse('Failed to update category', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const category = await prisma.category.deleteMany({
      where: {
        id: params.id,
        userId: user.userId,
        isDefault: false, // Prevent deleting default categories
      },
    });

    if (category.count === 0) {
      return errorResponse('Category not found or cannot be deleted', 404);
    }

    return successResponse(null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse('Failed to delete category', 500);
  }
}
