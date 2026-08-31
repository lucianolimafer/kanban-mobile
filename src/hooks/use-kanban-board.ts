import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { database, DEMO_BOARD_ID, kanbanRepository, seedDemoBoard } from '@/database';
import type { KanbanSnapshot, Task } from '@/domain';
import type { AddTaskInput, BoardColumnModel, BoardTask } from '@/features/board';

import { withCreatedTask } from './kanban-state';

export type ConfigurableColumn = {
  readonly id: string;
  readonly title: string;
  readonly color: string;
  readonly isVisible: boolean;
  readonly taskCount: number;
};

function dueLabel(task: Task): string | undefined {
  if (!task.dueAt) return undefined;
  const today = new Date();
  if (task.dueAt.toDateString() === today.toDateString()) return 'Today';
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short' }).format(task.dueAt);
}

function toBoardTask(task: Task): BoardTask {
  return {
    id: task.id,
    columnId: task.columnId,
    title: task.title,
    description: task.description ?? undefined,
    label: task.priority === 'high' ? 'High priority' : undefined,
    dueLabel: dueLabel(task),
    tone: task.tone,
  };
}

export function useKanbanBoard() {
  const [snapshot, setSnapshot] = useState<KanbanSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe(): void } | undefined;

    void seedDemoBoard(database)
      .then(() => {
        if (!mounted) return;
        subscription = kanbanRepository.observeSnapshot(DEMO_BOARD_ID, (next) => {
          setSnapshot(next);
          setError(null);
        });
      })
      .catch((cause: unknown) => {
        if (mounted) {
          console.error(cause);
          setError('Local data could not be opened.');
        }
      });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshKey]);

  const columns = useMemo<readonly BoardColumnModel[]>(
    () =>
      snapshot?.columns.filter((column) => column.isVisible).map((column, index) => ({
        id: column.id,
        title: column.title,
        eyebrow: index === 0 ? 'Start here' : undefined,
        accentColor: column.color,
        tasks: column.tasks.map(toBoardTask),
      })) ?? [],
    [snapshot],
  );

  const configurableColumns = useMemo<readonly ConfigurableColumn[]>(
    () =>
      snapshot?.columns.map((column) => ({
        id: column.id,
        title: column.title,
        color: column.color,
        isVisible: column.isVisible,
        taskCount: column.tasks.length,
      })) ?? [],
    [snapshot],
  );

  const runMutation = useCallback(async <T,>(mutation: () => Promise<T>): Promise<T> => {
    setIsSubmitting(true);
    try {
      const result = await mutation();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return result;
    } catch (cause) {
      console.error(cause);
      setError('The change could not be saved. Try again.');
      throw cause;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const createColumn = useCallback(
    (title: string, color: string) =>
      runMutation(() =>
        kanbanRepository.createColumn({
          boardId: DEMO_BOARD_ID,
          title,
          color,
          isVisible: true,
        }),
      ),
    [runMutation],
  );

  const updateColumn = useCallback(
    (id: string, input: { title?: string; color?: string; isVisible?: boolean }) =>
      runMutation(() => kanbanRepository.updateColumn(id, input)),
    [runMutation],
  );

  const deleteColumn = useCallback(
    (id: string) => runMutation(() => kanbanRepository.deleteColumn(id)),
    [runMutation],
  );

  const moveColumn = useCallback(
    (columnId: string, targetIndex: number) =>
      runMutation(() => kanbanRepository.moveColumn({ columnId, targetIndex })),
    [runMutation],
  );

  const createTask = useCallback(
    (input: AddTaskInput) =>
      runMutation(async () => {
        const created = await kanbanRepository.createTask({
          columnId: input.columnId,
          title: input.title,
          description: input.description,
          tone: input.tone,
          position: 0,
        });

        // The database observer remains the source of truth, but reflecting the
        // confirmed record here makes creation immediate even if the native
        // adapter delivers its query notification on a later frame.
        setSnapshot((current) => withCreatedTask(current, created));
      }),
    [runMutation],
  );

  const updateTask = useCallback(
    (id: string, input: AddTaskInput) =>
      runMutation(async () => {
        const current = snapshot?.columns.flatMap((column) => column.tasks).find((task) => task.id === id);
        if (current && current.columnId !== input.columnId) {
          const target = snapshot?.columns.find((column) => column.id === input.columnId);
          await kanbanRepository.moveTask({ taskId: id, targetColumnId: input.columnId, targetIndex: target?.tasks.length ?? 0 });
        }
        await kanbanRepository.updateTask(id, {
          title: input.title,
          description: input.description ?? null,
          tone: input.tone,
        });
      }),
    [runMutation, snapshot],
  );

  const deleteTask = useCallback(
    (id: string) => runMutation(() => kanbanRepository.deleteTask(id)),
    [runMutation],
  );

  const moveTask = useCallback(
    (taskId: string, targetColumnId: string) => {
      const target = snapshot?.columns.find((column) => column.id === targetColumnId);
      void runMutation(() =>
        kanbanRepository.moveTask({ taskId, targetColumnId, targetIndex: target?.tasks.length ?? 0 }),
      );
    },
    [runMutation, snapshot],
  );

  return {
    boardTitle: snapshot?.board.title ?? 'My plan',
    columns,
    configurableColumns,
    createColumn,
    createTask,
    deleteColumn,
    deleteTask,
    error,
    isLoading: !snapshot && !error,
    isSubmitting,
    moveTask,
    moveColumn,
    retry: () => setRefreshKey((value) => value + 1),
    updateColumn,
    updateTask,
  };
}
