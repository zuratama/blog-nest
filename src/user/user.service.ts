import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UpdateUserDTO } from 'src/models/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<UserEntity> {
    return this.userRepo.findOne({ where: { username } });
  }

  async findById(id: number): Promise<UserEntity> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateUser(id: number, data: UpdateUserDTO) {
    await this.userRepo.update({ id }, data);
    return this.findById(id);
  }
}
