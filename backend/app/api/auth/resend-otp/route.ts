import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { generateOTP } from '@/lib/auth';
import { sendOTPEmail } from '@/lib/email';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const resendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = resendOTPSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { email } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (user.isVerified) {
      return errorResponse('Email already verified', 400);
    }

    // Delete old OTPs
    await prisma.oTP.deleteMany({
      where: { email },
    });

    // Generate new OTP
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
    await sendOTPEmail(email, otp, user.name);

    return successResponse(
      null,
      'OTP sent successfully'
    );
  } catch (error) {
    console.error('Resend OTP error:', error);
    return errorResponse('Failed to resend OTP', 500);
  }
}
