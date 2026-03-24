"use client";
import SidebarLayout from '@/components/layout/SidebarLayout';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  useProtectedRoute();
  return <SidebarLayout>{children ?? <div className="p-8">Loading...</div>}</SidebarLayout>;
}
