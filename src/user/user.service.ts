import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { ProfileRO } from 'src/models/user.models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async getFromUsername(
    username: string,
    currUser?: UserEntity,
  ): Promise<ProfileRO> {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!user) {
      throw new NotFoundException();
    }

    return { profile: user.toProfile(currUser) };
  }

  async followUser(
    actorUser: UserEntity,
    targetUsername: string,
  ): Promise<ProfileRO> {
    const targetUser = await this.userRepo.findOne({
      where: { username: targetUsername },
      relations: ['followers'],
    });
    if (!targetUser) {
      throw new NotFoundException();
    }

    targetUser.followers.push(actorUser);
    await targetUser.save();
    return { profile: targetUser.toProfile(actorUser) };
  }

  async unfollowUser(
    actorUser: UserEntity,
    targetUsername: string,
  ): Promise<ProfileRO> {
    const targetUser = await this.userRepo.findOne({
      where: { username: targetUsername },
      relations: ['followers'],
    });
    if (!targetUser) {
      throw new NotFoundException();
    }

    targetUser.followers = targetUser.followers.filter(
      user => user.id !== actorUser.id,
    );
    await targetUser.save();
    return { profile: targetUser.toProfile(actorUser) };
  }
}
