"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Topbar from './Topbar';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Campaigns', href: '/campaigns' },
  { name: 'Contacts', href: '/contacts' },
  { name: 'Messages', href: '/messages' },
  { name: 'Users', href: '/users' },
  { name: 'Billing', href: '/billing' },
];

export default function SidebarLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl border-b border-gray-800">Admin Panel</div>
        <nav className="flex-1 py-4">
          <ul className="space-y-2">
            {navItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-6 py-2 rounded transition-colors ${pathname.startsWith(item.href) ? 'bg-gray-800' : 'hover:bg-gray-700'}`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">
        <Topbar />
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
