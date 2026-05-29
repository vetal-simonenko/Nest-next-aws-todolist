import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { createRemoteJWKSet, jwtVerify } = await import('jose');

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const issuer = this.configService.getOrThrow<string>('COGNITO_ISSUER');
      const clientId =
        this.configService.getOrThrow<string>('COGNITO_CLIENT_ID');

      const jwks = createRemoteJWKSet(
        new URL(`${issuer}/.well-known/jwks.json`),
      );

      const { payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: clientId,
      });

      request.user = payload;

      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
