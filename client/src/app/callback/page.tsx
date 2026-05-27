'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from 'react-oidc-context';

export default function CallbackPage() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [auth.isAuthenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      Signing you in...
    </main>
  );
}
