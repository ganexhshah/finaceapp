import { NextResponse } from 'next/server';

export function successResponse(data: any, message: string = 'Success', status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status: number = 400, errors?: any) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401);
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404);
}

export function validationErrorResponse(errors: any) {
  return errorResponse('Validation failed', 422, errors);
}
