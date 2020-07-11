import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  UseGuards,
  Delete,
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from 'src/auth/user.decorator';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';
import { UserEntity } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  async findProfile(
    @User() currentUser: UserEntity,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.findByUsername(
      username,
      currentUser,
    );

    return { profile };
  }

  @Post('/:username/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async followUser(
    @User() currentUser: UserEntity,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.followUser(currentUser, username);
    return { profile };
  }

  @Delete('/:username/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @User() currentUser: UserEntity,
  ) {
    const profile = await this.userService.unfollowUser(currentUser, username);
    return { profile };
  }
}
