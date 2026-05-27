'use client';

import { useAuth } from 'react-oidc-context';

import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const auth = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in with your Cognito account.
        </p>

        <Button className="mt-6 w-full" onClick={() => auth.signinRedirect()}>
          Sign in
        </Button>
      </div>
    </main>
  );
}
