"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const publicRoutes = ['/login'];

export function useProtectedRoute() {
  const { token, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!token && !publicRoutes.includes(pathname)) {
      router.replace('/login');
    }
    if (token && publicRoutes.includes(pathname)) {
      router.replace('/dashboard');
    }
  }, [token, pathname, router, loading]);
}
