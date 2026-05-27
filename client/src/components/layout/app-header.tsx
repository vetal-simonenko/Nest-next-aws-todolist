'use client';

import { useAuth } from 'react-oidc-context';

import { Button } from '@/components/ui/button';

export function AppHeader() {
  const auth = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div>
        <p className="text-muted-foreground text-sm">Welcome back</p>
        <h2 className="text-lg font-semibold">Dashboard</h2>
      </div>

      <Button
        variant="outline"
        onClick={() => {
          auth.removeUser();
          window.location.href = '/login';
        }}
      >
        Logout
      </Button>
    </header>
  );
}
