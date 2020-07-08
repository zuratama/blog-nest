import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { LoginDTO, RegisterDTO } from 'src/models/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async register(credentials: RegisterDTO): Promise<UserEntity> {
    try {
      const user: UserEntity = this.userRepo.create(credentials);
      await user.save();
      return user;
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Username has already been taken');
      }
      throw new InternalServerErrorException();
    }
  }

  async login({ email, password }: LoginDTO): Promise<UserEntity> {
    try {
      const user = await this.userRepo.findOne({ where: { email } });
      if (user) {
        const isVaid = await user.comparePassword(password);
        if (isVaid) {
          return user;
        }
      }
      throw new UnauthorizedException('Invalid email or password');
    } catch (err) {
      throw err;
    }
  }
}
