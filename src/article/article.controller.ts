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
    @User() currUser: UserEntity,
    @Query() query: FindAllQuery,
  ): Promise<ArticlesRO> {
    return this.articleService.getAll(query, currUser);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  async findFeed(
    @User() currUser: UserEntity,
    @Query() query: FindFeedQuery,
  ): Promise<ArticlesRO> {
    return this.articleService.getFeed(query, currUser);
  }

  @Get(':slug')
  @UseGuards(OptionalAuthGuard)
  async findBySlug(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    const article = await this.articleService.getFromSlug(slug, currUser);
    return { article };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createArticle(
    @User() currUser: UserEntity,
    @Body(ValidationPipe) data: { article: CreateArticleDTO },
  ): Promise<ArticleRO> {
    const article = await this.articleService.createArticle(
      currUser,
      data.article,
    );
    return { article };
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  async updateArticle(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
    @Body(ValidationPipe) data: { article: UpdateArticleDTO },
  ): Promise<ArticleRO> {
    const article = await this.articleService.updateArticle(
      currUser,
      slug,
      data.article,
    );
    return { article };
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  async deleteArticle(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    const article = await this.articleService.deleteArticle(currUser, slug);
    return { article };
  }

  @Post('/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  async favoriteArticle(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    return this.articleService.favorite(currUser, slug);
  }

  @Delete('/:slug/favorite')
  @UseGuards(JwtAuthGuard)
  async unfavoriteArticle(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
  ): Promise<ArticleRO> {
    return this.articleService.unfavorite(currUser, slug);
  }

  @Post('/:slug/comments')
  @UseGuards(JwtAuthGuard)
  async comment(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
    @Body('comment', ValidationPipe) data: CreateCommentDTO,
  ): Promise<CommentRO> {
    return this.articleService.comment(currUser, slug, data);
  }

  @Get('/:slug/comments')
  @UseGuards(OptionalAuthGuard)
  async getComments(@Param('slug') slug: string): Promise<CommentsRO> {
    return this.articleService.getComments(slug);
  }

  @Delete('/:slug/comments/:id')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @User() currUser: UserEntity,
    @Param('slug') slug: string,
    @Param('id') id: number,
  ): Promise<ArticleRO> {
    return this.articleService.deleteComment(currUser, slug, id);
  }
}
