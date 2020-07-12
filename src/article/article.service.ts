import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';
import { CreateArticleDTO, UpdateArticleDTO } from 'src/models/article.models';

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

  async findBySlug(slug: string, currentUser?: UserEntity) {
    const article = await this.articleRepo.findOne({ where: { slug } });
    if (article) {
      return article.toArticle(currentUser);
    }

    throw new NotFoundException();
  }

  async createArticle(author: UserEntity, data: CreateArticleDTO) {
    const article = this.articleRepo.create(data);
    article.author = author;
    const { id } = await article.save();
    return (await this.findById(id)).toArticle(author);
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
      return updated.toArticle(author);
    }

    throw new UnauthorizedException();
  }

  async deleteArticle(author: UserEntity, slug: string) {
    const article = await this.findBySlug(slug);
    if (article && this.ensureOwnership(author, article)) {
      return this.articleRepo.remove(article);
    }

    throw new UnauthorizedException();
  }

  private ensureOwnership(user: UserEntity, article: ArticleEntity): boolean {
    return article.author.id === user.id;
  }
}
