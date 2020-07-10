import {
  Controller,
  Get,
  UseGuards,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from 'src/auth/user.decorator';
import { ValidUser, UpdateUserDTO } from 'src/models/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findCurrentUser(@User() { username }: ValidUser) {
    return this.userService.findByUsername(username);
  }

  @Put()
  @UseGuards(AuthGuard('jwt'))
  update(
    @User() { id }: ValidUser,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    data: UpdateUserDTO,
  ) {
    return this.userService.updateUser(id, data);
  }
}
