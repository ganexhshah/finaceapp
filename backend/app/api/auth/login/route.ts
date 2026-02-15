import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if verified
    if (!user.isVerified) {
      return errorResponse('Please verify your email first', 403);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      {
        user: userWithoutPassword,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse('Failed to login', 500);
  }
}
