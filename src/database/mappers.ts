import type {
  Board,
  BoardColumn,
  KanbanSnapshot,
  Task,
} from '@/domain';

import type { BoardModel, ColumnModel, TaskModel } from './models';

export const toBoard = (model: BoardModel): Board => ({
  id: model.id,
  title: model.title,
  color: model.color,
  position: model.position,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});

export const toColumn = (model: ColumnModel): BoardColumn => ({
  id: model.id,
  boardId: model.boardId,
  title: model.title,
  color: model.color,
  isVisible: !model.isHidden,
  position: model.position,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});

export const toTask = (model: TaskModel): Task => ({
  id: model.id,
  columnId: model.columnId,
  title: model.title,
  description: model.description,
  priority: model.priority,
  tone: model.tone,
  isCompleted: model.isCompleted,
  position: model.position,
  dueAt: model.dueAt,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});

export function toSnapshot(
  board: BoardModel,
  columns: readonly ColumnModel[],
  tasks: readonly TaskModel[],
): KanbanSnapshot {
  return {
    board: toBoard(board),
    columns: columns.map((column) => ({
      ...toColumn(column),
      tasks: tasks
        .filter((task) => task.columnId === column.id)
        .sort((left, right) => left.position - right.position)
        .map(toTask),
    })),
  };
}
