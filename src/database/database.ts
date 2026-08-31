import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { migrations } from './migrations';
import { BoardModel, ColumnModel, TaskModel } from './models';
import { schema } from './schema';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  // The bridge adapter is the compatible path for Expo SDK 57 / RN 0.86.
  // WatermelonDB 0.28's Android JSI package still relies on legacy host hooks.
  jsi: false,
  onSetUpError: (error) => {
    // Initialization failures are fatal for an offline-first app. Keep the
    // original error visible to native crash reporting and development logs.
    console.error('WatermelonDB setup failed', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [BoardModel, ColumnModel, TaskModel],
});
