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
} from 'src/models/article.models';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepo: Repository<ArticleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
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
      return this.getArticleData(article, currUser);
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
      const id = author ? author.id : 0;
      qb.andWhere('article.authorId = :id', { id });
    }

    if (query.favorited) {
      let target = await this.userRepo.findOne({
        username: query.favorited,
      });
      const favorites = target ? target.favorites : [];
      const ids = favorites.length ? favorites.map(article => article.id) : [0];
      qb.andWhere('article.authorId IN (:ids)', { ids });
    }

    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();
    qb.offset(query.offset | 0);
    qb.limit(query.limit | 20);

    const articles = await qb.getMany();
    return {
      articles: await this.getListArticleData(articles, currUser),
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
    ids = ids.length ? ids : [0];
    const qb = await this.articleRepo
      .createQueryBuilder('article')
      .where('article.authorId IN (:ids)', { ids });
    qb.orderBy('article.createdAt', 'DESC');

    const articlesCount = await qb.getCount();
    qb.offset(query.offset | 0);
    qb.limit(query.limit | 20);

    const articles = await qb.getMany();
    return {
      articles: await this.getListArticleData(articles, currUser),
      articlesCount,
    };
  }

  async createArticle(author: UserEntity, data: CreateArticleDTO) {
    const article = this.articleRepo.create(data);
    article.author = author;
    const newArticle = await article.save();
    return this.getArticleData(newArticle, author);
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
      return this.getArticleData(updated, author);
    }

    throw new UnauthorizedException();
  }

  async deleteArticle(author: UserEntity, slug: string) {
    const article = await this.findBySlug(slug);
    if (article && this.ensureOwnership(author, article)) {
      const deleted = await this.articleRepo.remove(article);
      return this.getArticleData(deleted, author);
    }

    throw new UnauthorizedException();
  }

  private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
    return article.author.id === user.id;
  }

  private async getArticleData(article: ArticleEntity, user?: UserEntity) {
    const relationUser = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['favorites'],
    });

    return article.toArticle(relationUser);
  }

  private async getListArticleData(
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
