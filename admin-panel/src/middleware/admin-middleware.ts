import { NextRequest, NextResponse } from 'next/server';
import { getToken } from '@/lib/token';
import api from '@/utils/api';

export async function middleware(req: NextRequest) {
  const token = getToken();
  if (!token) {
    return NextResponse.redirect('/login');
  }
  try {
    const { data } = await api.get('/auth/me');
    if (data.user.role !== 'admin') {
      return NextResponse.redirect('/dashboard');
    }
  } catch {
    return NextResponse.redirect('/login');
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
