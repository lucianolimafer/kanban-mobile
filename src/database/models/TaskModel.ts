import { Model, type Relation } from '@nozbe/watermelondb';
import {
  date,
  field,
  immutableRelation,
  readonly,
  text,
} from '@nozbe/watermelondb/decorators';

import type { TaskPriority, TaskTone } from '@/domain';

import type ColumnModel from './ColumnModel';

export default class TaskModel extends Model {
  static table = 'tasks';

  static associations = {
    columns: { type: 'belongs_to' as const, key: 'column_id' },
  };

  @field('column_id') columnId: string;
  @text('title') title: string;
  @field('description') description: string | null;
  @text('priority') priority: TaskPriority;
  @text('tone') tone: TaskTone;
  @field('is_completed') isCompleted: boolean;
  @field('position') position: number;
  @date('due_at') dueAt: Date | null;
  @readonly @date('created_at') createdAt: Date;
  @readonly @date('updated_at') updatedAt: Date;
  @immutableRelation('columns', 'column_id') column: Relation<ColumnModel>;
}
