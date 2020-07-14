import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { LoginDTO, RegisterDTO } from 'src/models/user.models';
import { AuthService } from './auth.service';

@Controller('users')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  register(@Body(ValidationPipe) credentials: { user: RegisterDTO }) {
    return this.authService.register(credentials.user);
  }

  @Post('login')
  login(@Body(ValidationPipe) credentials: { user: LoginDTO }) {
    return this.authService.login(credentials.user);
  }
}
