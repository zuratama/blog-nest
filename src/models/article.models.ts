import { IsArray, IsOptional, IsString } from 'class-validator';
import { ProfileData } from './user.models';
import { AbstractData } from './abstract.models';

export class CreateArticleDTO {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  tagList: string[];
}

export class UpdateArticleDTO {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  body: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagList: string[];
}

export class CreateCommentDTO {
  @IsString()
  body: string;
}

export interface FindFeedQuery {
  limit?: number;
  offset?: number;
}
export interface FindAllQuery extends FindFeedQuery {
  tag?: string;
  author?: string;
  favorited?: string;
}

export interface ArticleData extends AbstractData {
  slug: string;
  title: string;
  description: string;
  body?: string;
  tagList?: string[];
  favorited?: boolean;
  favoritesCount?: number;
  author?: ProfileData;
}
export interface ArticleRO {
  article: ArticleData;
}

export interface ArticlesRO {
  articles: ArticleData[];
  articlesCount: number;
}

export interface CommentData extends AbstractData {
  body: string;
  author?: ProfileData;
}

export interface CommentRO {
  comment: CommentData;
}
export interface CommentsRO {
  comments: CommentData[];
}
