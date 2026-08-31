import { Model, type Query } from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  readonly,
  text,
} from '@nozbe/watermelondb/decorators';

import type ColumnModel from './ColumnModel';

export default class BoardModel extends Model {
  static table = 'boards';

  static associations = {
    columns: { type: 'has_many' as const, foreignKey: 'board_id' },
  };

  @text('title') title: string;
  @text('color') color: string;
  @field('position') position: number;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
  @children('columns') columns: Query<ColumnModel>;
}
