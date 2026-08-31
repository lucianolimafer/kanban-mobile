import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { migrations } from './migrations';
import { BoardModel, ColumnModel, TaskModel } from './models';
import { schema } from './schema';

const adapter = new LokiJSAdapter({
  schema,
  migrations,
  dbName: 'flowboard',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  onSetUpError: (error) => console.error('WatermelonDB web setup failed', error),
});

export const database = new Database({
  adapter,
  modelClasses: [BoardModel, ColumnModel, TaskModel],
});
