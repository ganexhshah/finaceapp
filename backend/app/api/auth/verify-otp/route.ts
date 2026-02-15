import { NextRequest } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { sendWelcomeEmail } from '@/lib/email';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/response';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = verifyOTPSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(validation.error.errors);
    }

    const { email, otp } = validation.data;

    // Find OTP
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return errorResponse('Invalid or expired OTP', 400);
    }

    // Update user verification status
    const user = await prisma.user.update({
      where: { email },
      data: { isVerified: true },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
      },
    });

    // Create default settings
    await prisma.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    // Create default categories
    const defaultIncomeCategories = [
      { name: 'Salary', icon: 'wallet', type: 'income', isDefault: true },
      { name: 'Freelance', icon: 'briefcase', type: 'income', isDefault: true },
      { name: 'Investment', icon: 'trending-up', type: 'income', isDefault: true },
      { name: 'Bonus', icon: 'gift', type: 'income', isDefault: true },
      { name: 'Business', icon: 'business', type: 'income', isDefault: true },
      { name: 'Other', icon: 'cash', type: 'income', isDefault: true },
    ];

    const defaultExpenseCategories = [
      { name: 'Food', icon: 'restaurant', type: 'expense', isDefault: true },
      { name: 'Transport', icon: 'car', type: 'expense', isDefault: true },
      { name: 'Shopping', icon: 'cart', type: 'expense', isDefault: true },
      { name: 'Entertainment', icon: 'game-controller', type: 'expense', isDefault: true },
      { name: 'Bills', icon: 'receipt', type: 'expense', isDefault: true },
      { name: 'Health', icon: 'fitness', type: 'expense', isDefault: true },
      { name: 'Education', icon: 'school', type: 'expense', isDefault: true },
      { name: 'Travel', icon: 'airplane', type: 'expense', isDefault: true },
    ];

    await prisma.category.createMany({
      data: [
        ...defaultIncomeCategories.map(cat => ({ ...cat, userId: user.id })),
        ...defaultExpenseCategories.map(cat => ({ ...cat, userId: user.id })),
      ],
    });

    // Create default cash account
    await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Cash',
        type: 'cash',
        balance: 0,
        isDefault: true,
        color: '#10b981',
        icon: 'cash',
      },
    });

    // Delete used OTP
    await prisma.oTP.delete({
      where: { id: otpRecord.id },
    });

    // Send welcome email
    await sendWelcomeEmail(email, user.name);

    return successResponse(
      { user },
      'Email verified successfully'
    );
  } catch (error) {
    console.error('Verify OTP error:', error);
    return errorResponse('Failed to verify OTP', 500);
  }
}
