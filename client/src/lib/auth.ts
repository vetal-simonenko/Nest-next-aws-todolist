import type { AuthProviderProps } from 'react-oidc-context';

export const cognitoAuthConfig: AuthProviderProps = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI!,
  response_type: 'code',
  scope: 'openid',
  post_logout_redirect_uri: process.env.NEXT_PUBLIC_COGNITO_LOGOUT_URI!,
};
