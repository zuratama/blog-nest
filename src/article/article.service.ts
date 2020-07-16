import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  ArticlesRO,
  ArticleRO,
  CreateCommentDTO,
  CommentRO,
  CommentsRO,
} from 'src/models/article.models';
import { CommentEntity } from 'src/entities/comment.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
  ) {}

  findById(id: number) {
    return this.articleRepo.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.articleRepo.findOne({ where: { slug } });
  }

  async getFromSlug(slug: string, currUser?: UserEntity) {
    const article = await this.findBySlug(slug);
    if (article) {
      return this.upgradeArticle(article, currUser);
    }

    throw new NotFoundException();
  }

  async getAll(
    query: FindAllQuery,
    currUser?: UserEntity,
  ): Promise<ArticlesRO> {
    const qb = await this.articleRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.author', 'author');
    qb.where('1 = 1');

    if (query.tag) {
      qb.andWhere('article.tagList LIKE :tag', { tag: `%${query.tag}%` });
    }

    if (query.author) {
      const author = await this.userRepo.findOne({
        username: query.author,
      });
      let id = 0;
      if (author) {
        id = author.id;
      }
      qb.andWhere('article.authorId = :id', { id });
    }

    if (query.favorited) {
      const target = await this.userRepo.findOne({
        username: query.favorited,
      });
      let ids = [0];
      if (target && target.favorites.length >= 0) {
        ids = target.favorites.map(article => article.id);
      }
      qb.andWhere('article.authorId IN (:ids)', { ids });
    }

    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();
    qb.offset(query.offset | 0);
    qb.limit(query.limit | 20);

    const articles = await qb.getMany();
    return {
      articles: await this.upgradeListArticles(articles, currUser),
      articlesCount,
    };
  }

  async getFeed(
    query: FindFeedQuery,
    currUser: UserEntity,
  ): Promise<ArticlesRO> {
    const { followees } = await this.userRepo.findOne({
      where: { id: currUser.id },
      relations: ['followees'],
    });

    if (!Array.isArray(followees) || followees.length <= 0) {
      return { articles: [], articlesCount: 0 };
    }

    let ids = followees.map(u => u.id);
    const qb = await this.articleRepo
      .createQueryBuilder('article')
      .where('article.authorId IN (:ids)', { ids });
    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();
    qb.offset(query.offset | 0);
    qb.limit(query.limit | 20);

    const articles = await qb.getMany();
    return {
      articles: await this.upgradeListArticles(articles, currUser),
      articlesCount,
    };
  }

  async createArticle(author: UserEntity, data: CreateArticleDTO) {
    const article = this.articleRepo.create(data);
    article.author = author;
    const newArticle = await article.save();
    return this.upgradeArticle(newArticle, author);
  }

  async updateArticle(
    author: UserEntity,
    slug: string,
    data: UpdateArticleDTO,
  ) {
    const article = await this.findBySlug(slug);
    if (article && this.ensureOwnership(author, article)) {
      await this.articleRepo.update({ id: article.id }, data);
      const updated = await this.findById(article.id);
      return this.upgradeArticle(updated, author);
    }

    throw new UnauthorizedException();
  }

  async deleteArticle(author: UserEntity, slug: string) {
    const article = await this.findBySlug(slug);
    if (article && this.ensureOwnership(author, article)) {
      const deleted = await this.articleRepo.remove(article);
      return this.upgradeArticle(deleted, author);
    }

    throw new UnauthorizedException();
  }

  async favorite(user: UserEntity, slug: string): Promise<ArticleRO> {
    let article = await this.findBySlug(slug);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const relationUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['favorites'],
    });
    const isFirstFav =
      relationUser.favorites.findIndex(a => a.id === article.id) < 0;
    if (isFirstFav) {
      relationUser.favorites.push(article);
      article.favoritesCount++;
      await relationUser.save();
      article = await article.save();
    }

    return { article: article.toArticle(relationUser) };
  }

  async unfavorite(user: UserEntity, slug: string): Promise<ArticleRO> {
    let article = await this.findBySlug(slug);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const relationUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['favorites'],
    });
    const unfavIndex = relationUser.favorites.findIndex(
      a => a.id === article.id,
    );
    if (unfavIndex >= 0) {
      relationUser.favorites.splice(unfavIndex, 1);
      article.favoritesCount--;
      await relationUser.save();
      article = await article.save();
    }

    return { article: article.toArticle(relationUser) };
  }

  async getComments(slug: string): Promise<CommentsRO> {
    const article = await this.articleRepo.findOne({
      where: { slug },
      relations: ['comments'],
    });
    return { comments: article.comments.map(c => c.toComment()) };
  }

  async comment(
    user: UserEntity,
    slug: string,
    comment: CreateCommentDTO,
  ): Promise<CommentRO> {
    const article = await this.articleRepo.findOne({ where: { slug } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    const created = await this.commentRepo.create(comment);
    created.author = user;
    created.article = article;
    const newComment = await created.save();
    return { comment: newComment.toComment() };
  }

  async deleteComment(
    user: UserEntity,
    slug: string,
    id: number,
  ): Promise<ArticleRO> {
    const comment = await this.commentRepo.findOne({ where: { id } });
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (user.id !== comment.author.id) {
      throw new UnauthorizedException();
    }

    await this.commentRepo.remove(comment);
    const article = await this.articleRepo.findOne({ where: { slug } });
    return { article: await this.upgradeArticle(article, user) };
  }

  private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
    return article.author.id === user.id;
  }

  private async upgradeArticle(article: ArticleEntity, user?: UserEntity) {
    const relationUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['favorites'],
    });

    return article.toArticle(relationUser);
  }

  private async upgradeListArticles(
    articles: ArticleEntity[],
    user?: UserEntity,
  ) {
    const relationUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['favorites'],
    });

    return articles.map(a => a.toArticle(relationUser));
  }
}
