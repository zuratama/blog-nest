import { Injectable } from '@nestjs/common';
import { Item } from './interfaces/item.interface';

@Injectable()
export class ItemsService {
  constructor() {}

  async findAll(): Promise<Item[]> {
    return null;
  }

  async findOne(id: string): Promise<Item> {
    return null;
  }

  async create(item: Item): Promise<Item> {
    return null;
  }

  async delete(id: string): Promise<Item> {
    return null;
  }

  async update(id: string, item: Item): Promise<Item> {
    return null;
  }
}
