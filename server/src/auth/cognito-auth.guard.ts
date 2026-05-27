import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, createRemoteJWKSet } from 'jose';

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly configService: ConfigService) {
    const issuer = this.configService.getOrThrow<string>('COGNITO_ISSUER');

    this.jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

      const { payload } = await jwtVerify(token, this.jwks, {
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
