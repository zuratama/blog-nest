import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateUserDTO } from 'src/models/user.models';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByUsername(
    username: string,
    currentUser?: UserEntity,
  ): Promise<UserEntity> {
    const user = await this.userRepo.findOne({
      where: { username },
      relations: ['followers'],
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user.toProfile(currentUser);
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    await this.userRepo.update({ id }, data);
    return this.findById(id);
  }

  async followUser(actorUser: UserEntity, targetUsername: string) {
    const targetUser = await this.userRepo.findOne({
      where: { username: targetUsername },
      relations: ['followers'],
    });
    if (!targetUser) {
      throw new NotFoundException();
    }
    targetUser.followers.push(actorUser);
    await targetUser.save();
    return targetUser.toProfile(actorUser);
  }

  async unfollowUser(actorUser: UserEntity, targetUsername: string) {
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
    return targetUser.toProfile(actorUser);
  }
}
