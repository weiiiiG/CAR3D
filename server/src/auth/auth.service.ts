import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(username: string, pass: string) {
    const user = await this.validateUser(username, pass);
    if (!user) throw new UnauthorizedException('用户名或密码错误');
    return this.generateTokens(user);
  }

  async refresh(user: any) {
    // Verify user still exists
    const dbUser = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!dbUser) throw new UnauthorizedException();
    return this.generateTokens({ id: dbUser.id, username: dbUser.username, role: dbUser.role });
  }

  private generateTokens(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  verifyToken(token: string) {
    try { return this.jwtService.verify(token); }
    catch { return null; }
  }
}
