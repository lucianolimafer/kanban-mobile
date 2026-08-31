import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'boards',
      columns: [
        { name: 'title', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'columns',
      columns: [
        { name: 'board_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'is_hidden_v2', type: 'boolean' },
        { name: 'position', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        { name: 'column_id', type: 'string', isIndexed: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'priority', type: 'string' },
        { name: 'tone', type: 'string' },
        { name: 'is_completed', type: 'boolean' },
        { name: 'position', type: 'number' },
        { name: 'due_at', type: 'number', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),
  ],
});
