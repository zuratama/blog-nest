import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator';

export class LoginDTO {
  @IsEmail()
  @IsString()
  @MinLength(4)
  email: string;

  @IsString()
  @MinLength(4)
  password: string;
}

export class RegisterDTO extends LoginDTO {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
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

interface UserSharedData {
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
