import { addColumns, schemaMigrations } from '@nozbe/watermelondb/Schema/migrations';

// Version 1 is the first public schema. Every future schema change must add a
// migration here before the schema version is bumped, so offline data survives.
export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'columns',
          columns: [{ name: 'is_hidden', type: 'boolean' }],
        }),
      ],
    },
    {
      // Some fresh v2 databases were created while `is_hidden` was
      // accidentally declared on `boards`. A new column name repairs both
      // those databases and correctly migrated v2 databases without a
      // destructive table rebuild or loss of offline data.
      toVersion: 3,
      steps: [
        addColumns({
          table: 'columns',
          columns: [{ name: 'is_hidden_v2', type: 'boolean' }],
        }),
      ],
    },
  ],
});
