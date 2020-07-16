import {
  Entity,
  Column,
  BeforeInsert,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Exclude, classToPlain } from 'class-transformer';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { AbstractEntity } from './abstract-entity';
import { ArticleEntity } from './article.entity';
import { ProfileData } from 'src/models/user.models';
import { CommentEntity } from './comment.entity';

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

  @OneToMany(
    _type => CommentEntity,
    comment => comment.author,
    { cascade: true },
  )
  comments: CommentEntity[];

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

  toProfile(user?: UserEntity): ProfileData {
    let following = null;
    if (user) {
      following = this.followers.findIndex(u => u.id === user.id) >= 0;
    }
    const profile: any = this.toJSON();
    delete profile.followers;
    return { ...profile, following };
  }
}
