import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';
import { AbstractData } from './abstract.models';

export class LoginDTO {
  @IsEmail({}, { message: 'Incorrect email address format' })
  @IsString()
  email: string;

  @IsString()
  @MinLength(4, { message: 'Password length requires at least 4 characters' })
  password: string;
}

export class RegisterDTO extends LoginDTO {
  @IsString()
  @MinLength(4, { message: 'Username must have at least 4 characters' })
  @MaxLength(20, { message: 'Username can have no more than 20 characters' })
  username: string;
}

export class UpdateUserDTO {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsOptional()
  image: string;

  @IsOptional()
  bio: string;
}

export interface AuthPayload {
  sub: number;
  username: string;
}

interface UserSharedData extends AbstractData {
  username: string;
  bio: string;
  image?: string;
}

export interface UserData extends UserSharedData {
  email: string;
  token: string;
}

export interface UserRO {
  user: UserData;
}

export interface ProfileData extends UserSharedData {
  following?: boolean;
}

export interface ProfileRO {
  profile: ProfileData;
}
