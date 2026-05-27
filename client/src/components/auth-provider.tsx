'use client';

import { AuthProvider } from 'react-oidc-context';

import { cognitoAuthConfig } from '@/lib/auth';

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider {...cognitoAuthConfig}>{children}</AuthProvider>;
}
