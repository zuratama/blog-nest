import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract-entity';

@Entity('tag')
export class TagEntity extends AbstractEntity {
  @Column()
  tag: string;
}
