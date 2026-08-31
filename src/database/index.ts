import { database } from './database';
import { KanbanWatermelonRepository } from './KanbanWatermelonRepository';

export { database } from './database';
export { KanbanWatermelonRepository } from './KanbanWatermelonRepository';
export { migrations } from './migrations';
export * from './models';
export { schema } from './schema';
export { DEMO_BOARD_ID, seedDemoBoard } from './seed';

export const kanbanRepository = new KanbanWatermelonRepository(database);
