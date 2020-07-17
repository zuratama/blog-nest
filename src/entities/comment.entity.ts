import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { AbstractEntity } from './abstract-entity';
import { ArticleEntity } from './article.entity';
import { UserEntity } from './user.entity';
import { classToPlain } from 'class-transformer';
import { CommentData } from 'src/models/article.models';

@Entity('comment')
export class CommentEntity extends AbstractEntity {
  @Column()
  body: string;

  @ManyToOne(
    _type => UserEntity,
    user => user.comments,
    { eager: true, nullable: false, onDelete: 'CASCADE' },
  )
  author: UserEntity;

  @ManyToOne(
    _type => ArticleEntity,
    article => article.comments,
    { nullable: false, onDelete: 'CASCADE' },
  )
  article: ArticleEntity;

  toJSON() {
    return classToPlain(this);
  }

  toComment(): CommentData {
    const comment: any = this.toJSON();
    return { ...comment };
  }
}
