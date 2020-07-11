import {
  Controller,
  Get,
  Param,
  NotFoundException,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from './user.service';
import { User } from 'src/auth/user.decorator';
import { ValidUser } from 'src/models/user.dto';

@Controller('profiles')
export class ProfileController {
  constructor(private userService: UserService) {}

  @Get(':username')
  async findProfile(@Param('username') username: string) {
    const profile = await this.userService.findByUsername(username);
    if (!profile) {
      throw new NotFoundException();
    }

    return { profile };
  }

  @Post('/:username/follow')
  @UseGuards(AuthGuard('jwt'))
  async followUser(
    @User() { id }: ValidUser,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.followUser(id, username);
    return { profile };
  }

  @Delete('/:username/unfollow')
  @UseGuards(AuthGuard('jwt'))
  async unfollowUser(
    @User() { id }: ValidUser,
    @Param('username') username: string,
  ) {
    const profile = await this.userService.unfollowUser(id, username);
    return { profile };
  }
}
