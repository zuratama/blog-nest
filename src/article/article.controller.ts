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
  CommentRO,
  CreateCommentDTO,
  CommentsRO,
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

  @Post('/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  async favoriteArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    return this.articleService.favorite(user, slug);
  }

  @Delete('/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  async unfavoriteArticle(
    @User() user: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    return this.articleService.unfavorite(user, slug);
  }

  @Post('/:slug/comments')
  @UseGuards(JwtAuthGuard)
  async comment(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Body(ValidationPipe) data: { comment: CreateCommentDTO },
  ): Promise<CommentRO> {
    return this.articleService.comment(user, slug, data.comment);
  }

  @Get('/:slug/comments')
  @UseGuards(OptionalAuthGuard)
  async getComments(@Param('slug') slug: string): Promise<CommentsRO> {
    return this.articleService.getComments(slug);
  }

  @Delete('/:slug/comments/:id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @User() user: UserEntity,
    @Param('slug') slug: string,
    @Param('id') id: number,
  ): Promise<ArticleRO> {
    return this.articleService.deleteComment(user, slug, id);
  }
}
