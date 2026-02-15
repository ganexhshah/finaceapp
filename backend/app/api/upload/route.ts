import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/middleware';
import { uploadImage } from '@/lib/cloudinary';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  const { error, user } = requireAuth(request);
  if (error) return error;

  try {
    const body = await request.json();
    const { image, folder = 'finance-tracker' } = body;

    if (!image) {
      return errorResponse('Image is required', 400);
    }

    const result = await uploadImage(image, folder);

    if (!result.success) {
      return errorResponse('Failed to upload image', 500);
    }

    return successResponse(
      { url: result.url, publicId: result.publicId },
      'Image uploaded successfully'
    );
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Failed to upload image', 500);
  }
}
