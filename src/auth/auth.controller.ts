import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  register(@Body() credentials) {
    return this.authService.register();
  }

  @Post('login')
  login(@Body() credentials) {
    return this.authService.login(credentials);
  }
}
