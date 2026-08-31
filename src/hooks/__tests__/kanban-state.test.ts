import type { KanbanSnapshot, Task } from '@/domain';

import { withCreatedTask } from '../kanban-state';

const now = new Date('2026-08-30T12:00:00.000Z');

const existingTask: Task = {
  id: 'task-existing',
  columnId: 'column-1',
  title: 'Existente',
  description: null,
  priority: 'medium',
  tone: 'mint',
  isCompleted: false,
  position: 1,
  dueAt: null,
  createdAt: now,
  updatedAt: now,
};

const snapshot: KanbanSnapshot = {
  board: {
    id: 'board-1',
    title: 'Board',
    color: '#000000',
    position: 0,
    createdAt: now,
    updatedAt: now,
  },
  columns: [
    {
      id: 'column-1',
      boardId: 'board-1',
      title: 'Column',
      color: '#FFFFFF',
      isVisible: true,
      position: 0,
      createdAt: now,
      updatedAt: now,
      tasks: [existingTask],
    },
  ],
};

describe('withCreatedTask', () => {
  it('shows a confirmed task first without duplicating it', () => {
    const created: Task = {
      ...existingTask,
      id: 'task-created',
      title: 'New task',
      position: 0,
    };

    const firstUpdate = withCreatedTask(snapshot, created);
    const repeatedUpdate = withCreatedTask(firstUpdate, created);

    expect(repeatedUpdate?.columns[0].tasks.map((task) => task.id)).toEqual([
      'task-created',
      'task-existing',
    ]);
  });
});
