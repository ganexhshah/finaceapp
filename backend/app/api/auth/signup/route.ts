import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = signupSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await prisma.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, otp, name);

    return successResponse(
      { user },
      'Account created successfully. Please check your email for OTP.',
      201
    );
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('Failed to create account', 500);
  }
}
