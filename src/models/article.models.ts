import { IsString, IsArray, IsOptional } from 'class-validator';
import { ArticleEntity } from 'src/entities/article.entity';
import { UserEntity } from 'src/entities/user.entity';

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

export interface FindFeedQuery {
  limit?: number;
  offset?: number;
}
export interface FindAllQuery extends FindFeedQuery {
  tag?: string;
  author?: string;
  favorited?: string;
}

export interface ArticleData {
  slug: string;
  title: string;
  description: string;
  body?: string;
  tagList?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  favorited?: boolean;
  favoritesCount?: number;
  author?: UserEntity;
}
export interface ArticleRO {
  article: ArticleData;
}

export interface ArticlesRO {
  articles: ArticleData[];
  articlesCount: number;
}
