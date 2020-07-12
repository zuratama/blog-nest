import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
  RelationCount,
  JoinTable,
} from 'typeorm';
import * as slugify from 'slug';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';
import { classToPlain } from 'class-transformer';

@Entity('article')
export class ArticleEntity extends AbstractEntity {
  @Column()
  slug: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  body: string;

  @ManyToOne(
    _type => UserEntity,
    user => user.article,
    { eager: true },
  )
  author: UserEntity;

  @ManyToMany(
    _type => UserEntity,
    user => user.favorites,
    { eager: true },
  )
  favoritedBy: UserEntity[];

  @RelationCount((article: ArticleEntity) => article.favoritedBy)
  favoritesCount: number;

  @Column('simple-array')
  tagList: string[];

  @BeforeInsert()
  generateSlug() {
    this.slug =
      slugify(this.title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  }

  toJSON() {
    return classToPlain(this);
  }

  toArticle(user: UserEntity) {
    let favorited = null;
    if (user) {
      favorited = this.favoritedBy.includes(user);
    }
    const article: any = this.toJSON();
    delete article.favoritedBy;
    return { ...article, favorited };
  }
}
