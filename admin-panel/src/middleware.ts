import { NextRequest, NextResponse } from 'next/server';


const publicRoutes = ['/login', '/api'];


export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicRoutes.some(route => pathname.startsWith(route));
  if (!isPublic) {
    const token = request.cookies.get('token')?.value || '';
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|static|favicon.ico|login).*)',
  ],
};
