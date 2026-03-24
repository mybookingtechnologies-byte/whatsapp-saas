"use client";
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function LoginProtectedLayout({ children }: { children: React.ReactNode }) {
  useProtectedRoute();
  return <>{children}</>;
}
