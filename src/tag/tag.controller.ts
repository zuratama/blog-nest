import { Controller, Get } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagsRO } from 'src/models/tag.models';

@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  getAll(): Promise<TagsRO> {
    return this.tagService.getAll();
  }
}
