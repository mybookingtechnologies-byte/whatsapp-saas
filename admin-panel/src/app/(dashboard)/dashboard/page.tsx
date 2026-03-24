import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import DashboardHome from '@/components/dashboard/DashboardHome';

export default async function DashboardPage() {
  // Add server-side auth check here if needed
  // For now, just render the dashboard
  return <DashboardHome />;
}
