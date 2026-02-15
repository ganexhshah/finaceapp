import { NextRequest } from 'next/server';
import { getUserFromRequest } from './auth';
import { unauthorizedResponse } from './response';

export function requireAuth(request: NextRequest) {
  const user = getUserFromRequest(request);
  
  if (!user) {
    return { error: unauthorizedResponse('Authentication required'), user: null };
  }
  
  return { error: null, user };
}
