import type { KanbanSnapshot, Task } from '@/domain';

export function withCreatedTask(
  snapshot: KanbanSnapshot | null,
  created: Task,
): KanbanSnapshot | null {
  if (!snapshot) return snapshot;

  return {
    ...snapshot,
    columns: snapshot.columns.map((column) =>
      column.id === created.columnId
        ? {
            ...column,
            tasks: [
              created,
              ...column.tasks.filter((task) => task.id !== created.id),
            ],
          }
        : column,
    ),
  };
}
