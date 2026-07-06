import { Controller, Post, Get, Body, UseGuards, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Response, Request } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: { username: string; password: string }, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.username, dto.password);
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true, secure: false, sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
    });
    return { access_token: result.access_token, user: result.user };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.refresh_token;
    if (!token) throw new UnauthorizedException();
    const payload = this.authService.verifyToken(token);
    if (!payload) throw new UnauthorizedException();
    const result = await this.authService.refresh(payload);
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true, secure: false, sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, path: '/api/auth',
    });
    return { access_token: result.access_token, user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/auth' });
    return { message: 'ok' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: any) {
    return req.user;
  }
}
