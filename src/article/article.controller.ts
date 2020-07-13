import {
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/auth/user.decorator';
import { UserEntity } from 'src/entities/user.entity';
import {
  CreateArticleDTO,
  UpdateArticleDTO,
  FindAllQuery,
  FindFeedQuery,
  ArticlesRO,
  ArticleRO,
} from 'src/models/article.models';
import { OptionalAuthGuard } from 'src/auth/optional-auth.guard';

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  async findAll(
    @User() user: UserEntity,
    @Query() query: FindAllQuery,
  ): Promise<ArticlesRO> {
    return this.articleService.getAll(query, user);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async findFeed(
    @User() user: UserEntity,
    @Query() query: FindFeedQuery,
  ): Promise<ArticlesRO> {
    return this.articleService.getFeed(query, user);
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findBySlug(
    @Param('slug') slug: string,
    @User() user: UserEntity,
  ): Promise<ArticleRO> {
    const article = await this.articleService.getFromSlug(slug, user);
    return { article };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @User() user: UserEntity,
    @Body(ValidationPipe) data: { article: CreateArticleDTO },
  ): Promise<ArticleRO> {
    const article = await this.articleService.createArticle(user, data.article);
    return { article };
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body(ValidationPipe) data: { article: UpdateArticleDTO },
  ): Promise<ArticleRO> {
    const article = await this.articleService.updateArticle(
      user,
      slug,
      data.article,
    );
    return { article };
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    const article = await this.articleService.deleteArticle(user, slug);
    return { article };
  }
}
