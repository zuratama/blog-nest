import {
  Entity,
  Column,
  BeforeInsert,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import * as slugify from 'slug';
import { classToPlain } from 'class-transformer';
import { AbstractEntity } from './abstract-entity';
import { UserEntity } from './user.entity';
import { ArticleData } from 'src/models/article.models';
import { CommentEntity } from './comment.entity';

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

  @OneToMany(
    _type => CommentEntity,
    comment => comment.article,
    { cascade: true },
  )
  comments: CommentEntity[];

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
      favorited = user.favorites.findIndex(a => a.id === this.id) != -1;
    }
    delete this.author.email;
    const article: any = this.toJSON();
    return { ...article, favorited };
  }
}
