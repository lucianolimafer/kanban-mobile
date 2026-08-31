import { DndProvider, type DndProviderProps } from '@mgcrea/react-native-dnd';
import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { runOnJS } from 'react-native-reanimated';

import { FeedbackState } from '@/components/primitives/FeedbackState';

import { BoardColumn } from './BoardColumn';
import type { BoardColumnModel, BoardTask, TaskMoveHandler } from './types';

const COLLAPSED_COLUMN_WIDTH = 72;
const COLUMN_GAP = 14;

export type ColumnPagerProps = {
  columns: readonly BoardColumnModel[];
  onTaskMove: TaskMoveHandler;
  onTaskPress?: (task: BoardTask) => void;
  onAddTask?: (columnId: string) => void;
  dragEnabled?: boolean;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
};

export function ColumnPager({
  columns,
  onTaskMove,
  onTaskPress,
  onAddTask,
  dragEnabled = true,
  isLoading = false,
  errorMessage = null,
  onRetry,
}: ColumnPagerProps) {
  const { width: viewportWidth } = useWindowDimensions();
  const [collapsedColumnIds, setCollapsedColumnIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const columnWidth = Math.min(326, Math.max(270, viewportWidth - 52));
  const columnOptions = useMemo(
    () => columns.map(({ id, title }) => ({ id, title })),
    [columns],
  );
  const snapOffsets = useMemo(
    () =>
      columns.reduce<{ offsets: number[]; next: number }>(
        (result, column) => ({
          offsets: [...result.offsets, result.next],
          next:
            result.next +
            (collapsedColumnIds.has(column.id) ? COLLAPSED_COLUMN_WIDTH : columnWidth) +
            COLUMN_GAP,
        }),
        { offsets: [], next: 0 },
      ).offsets,
    [collapsedColumnIds, columnWidth, columns],
  );

  const toggleColumn = useCallback((columnId: string) => {
    setCollapsedColumnIds((current) => {
      const next = new Set(current);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      return next;
    });
  }, []);

  const handleDragEnd: DndProviderProps['onDragEnd'] = ({ active, over }) => {
    'worklet';
    const sourceColumnId = String(active.data.value.columnId);
    const targetColumnId = over ? String(over.id) : null;
    if (targetColumnId && sourceColumnId !== targetColumnId) {
      runOnJS(onTaskMove)(String(active.id), targetColumnId);
    }
  };

  if (isLoading) return <FeedbackState kind="loading" />;
  if (errorMessage) {
    return <FeedbackState actionLabel={onRetry ? 'Tentar novamente' : undefined} kind="error" message={errorMessage} onAction={onRetry} />;
  }
  if (columns.length === 0) {
    return <FeedbackState actionLabel={onAddTask ? 'Get started' : undefined} kind="empty" onAction={onAddTask ? () => onAddTask('') : undefined} />;
  }

  return (
    <DndProvider onDragEnd={handleDragEnd} style={styles.root}>
      <View style={styles.root}>
        <ScrollView
          accessibilityLabel="Board columns"
          contentContainerStyle={styles.content}
          decelerationRate="fast"
          horizontal
          keyboardDismissMode="on-drag"
          removeClippedSubviews={false}
          showsHorizontalScrollIndicator={false}
          snapToOffsets={snapOffsets}>
          {columns.map((column) => (
            <BoardColumn
              allColumns={columnOptions}
              collapsed={collapsedColumnIds.has(column.id)}
              column={column}
              dragEnabled={dragEnabled}
              key={column.id}
              onAddTask={onAddTask}
              onToggleCollapsed={() => toggleColumn(column.id)}
              onTaskMove={onTaskMove}
              onTaskPress={onTaskPress}
              width={columnWidth}
            />
          ))}
        </ScrollView>
      </View>
    </DndProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'visible' },
  content: { paddingBottom: 24, paddingLeft: 18, paddingRight: 4 },
});
