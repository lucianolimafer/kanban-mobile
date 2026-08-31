import { Model, type Query, type Relation } from '@nozbe/watermelondb';
import {
  children,
  date,
  field,
  immutableRelation,
  readonly,
  text,
} from '@nozbe/watermelondb/decorators';

import type BoardModel from './BoardModel';
import type TaskModel from './TaskModel';

export default class ColumnModel extends Model {
  static table = 'columns';

  static associations = {
    boards: { type: 'belongs_to' as const, key: 'board_id' },
    tasks: { type: 'has_many' as const, foreignKey: 'column_id' },
  };

  @field('board_id') boardId: string;
  @text('title') title: string;
  @text('color') color: string;
  @field('is_hidden_v2') isHidden: boolean;
  @field('position') position: number;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
  @immutableRelation('boards', 'board_id') board: Relation<BoardModel>;
  @children('tasks') tasks: Query<TaskModel>;
}
