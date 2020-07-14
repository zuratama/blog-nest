import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/auth/user.decorator';
import { UpdateUserDTO } from 'src/models/user.models';
import { UserEntity } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findCurrentUser(@User() user: UserEntity) {
    return { user: this.authService.signFromUser(user) };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @User() { id }: UserEntity,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO,
  ) {
    const user = await this.userService.updateUser(id, data);
    return { user: this.authService.signFromUser(user) };
  }
}
