"use client";
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/button';

export default function Topbar() {
  const { logout } = useAuth();
  return (
    <div className="flex items-center justify-end h-12 px-6 bg-white border-b border-gray-200">
      <Button onClick={logout} className="ml-auto">Logout</Button>
    </div>
  );
}
