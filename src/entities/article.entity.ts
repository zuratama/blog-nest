import { Entity, Column, BeforeInsert, ManyToOne } from 'typeorm';
import * as slugify from 'slug';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';
import { classToPlain } from 'class-transformer';
import { ArticleData } from 'src/models/article.models';

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
    user => user.articles,
    { eager: true },
  )
  author: UserEntity;

  @Column({ default: 0 })
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

  toArticle(user?: UserEntity): ArticleData {
    let favorited = null;
    if (user) {
      favorited = user.favorites.findIndex(a => a.id === this.id);
    }
    const article: any = this.toJSON();
    return { ...article, favorited };
  }
}
