import { redirect } from 'next/navigation';

export default function Home() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  }
  // SSR fallback (should never render)
  return null;
}
