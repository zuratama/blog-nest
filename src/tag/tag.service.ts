import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TagEntity } from 'src/entities/tag.entity';
import { Repository } from 'typeorm';
import { TagsRO } from 'src/models/tag.models';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(TagEntity)
    private readonly tagRepo: Repository<TagEntity>,
  ) {}

  async getAll(): Promise<TagsRO> {
    const tags = await this.tagRepo.find();
    return { tags: tags.map(t => t.tag) };
  }
}
