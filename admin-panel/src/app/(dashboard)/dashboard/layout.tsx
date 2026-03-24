"use client";
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function DashboardProtectedLayout({ children }: { children: React.ReactNode }) {
  useProtectedRoute();
  return <>{children}</>;
}
