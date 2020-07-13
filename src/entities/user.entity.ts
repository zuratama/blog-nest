import {
  Entity,
  Column,
  BeforeInsert,
  JoinTable,
  ManyToMany,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Exclude, classToPlain } from 'class-transformer';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { AbstractEntity } from './abstract-entity';
import { ArticleEntity } from './article.entity';

@Entity('user')
export class UserEntity extends AbstractEntity {
  @Column()
  @IsEmail()
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: null, nullable: true })
  image: string | null;

  @JoinTable()
  @ManyToMany(
    _type => UserEntity,
    user => user.followees,
  )
  followers: UserEntity[];

  @JoinTable()
  @ManyToMany(
    _type => UserEntity,
    user => user.followers,
  )
  followees: UserEntity[];

  @OneToMany(
    _type => ArticleEntity,
    article => article.author,
  )
  articles: ArticleEntity[];

  @ManyToMany(_type => ArticleEntity)
  @JoinTable()
  favorites: ArticleEntity[];

  // TODO: add following
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password);
  }

  toJSON() {
    return classToPlain(this);
  }

  toProfile(user?: UserEntity) {
    let following = null;
    if (user) {
      following = this.followers.includes(user);
    }
    const profile: any = this.toJSON();
    delete profile.followers;
    return { ...profile, following };
  }
}
