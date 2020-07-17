import {
  Controller,
  Get,
  Param,
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
import { ProfileRO } from 'src/models/user.models';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get(':username')
  @UseGuards(OptionalAuthGuard)
  async findProfile(
    @User() currUser: UserEntity,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.getFromUsername(username, currUser);
  }

  @Post('/:username/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async followUser(
    @User() currUser: UserEntity,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.followUser(currUser, username);
  }

  @Delete('/:username/follow')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @User() currUser: UserEntity,
    @Param('username') username: string,
  ): Promise<ProfileRO> {
    return this.userService.unfollowUser(currUser, username);
  }
}
