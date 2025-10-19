import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const token = client.handshake.auth.token || 
                 client.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new WsException('Токен не предоставлен');
    }

    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const payload = this.jwtService.verify(token, { secret: jwtSecret });
      client.userId = payload.sub;
      return true;
    } catch (error) {
      throw new WsException('Недействительный токен');
    }
  }
}
