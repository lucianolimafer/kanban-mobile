import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Appearance, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AddTaskSheet,
  BoardHeader,
  ColumnPager,
  type AddTaskInput,
  type BoardTask,
} from '@/features/board';
import { useKanbanBoard } from '@/hooks/use-kanban-board';
import { useAppTheme } from '@/theme';

export default function BoardScreen() {
  const board = useKanbanBoard();
  const theme = useAppTheme();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [initialColumnId, setInitialColumnId] = useState<string>();
  const [selectedTask, setSelectedTask] = useState<BoardTask | null>(null);

  const openCreate = (columnId?: string) => {
    setEditorKey((value) => value + 1);
    setSelectedTask(null);
    setInitialColumnId(columnId);
    setSheetVisible(true);
  };

  const openEdit = (task: BoardTask) => {
    setEditorKey((value) => value + 1);
    setSelectedTask(task);
    setInitialColumnId(task.columnId);
    setSheetVisible(true);
  };

  const closeSheet = () => {
    if (board.isSubmitting) return;
    setSheetVisible(false);
    setSelectedTask(null);
  };

  const submitTask = async (input: AddTaskInput) => {
    if (selectedTask) await board.updateTask(selectedTask.id, input);
    else await board.createTask(input);
    setSheetVisible(false);
    setSelectedTask(null);
  };

  const confirmDelete = () => {
    if (!selectedTask) return;
    Alert.alert('Delete task?', 'This action removes the task from this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void board.deleteTask(selectedTask.id).then(() => {
            setSheetVisible(false);
            setSelectedTask(null);
          });
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.surface.canvas }]}>
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <BoardHeader
          onAddTask={board.columns.length > 0 ? () => openCreate() : undefined}
          onToggleTheme={() =>
            Appearance.setColorScheme(theme.colorScheme === 'dark' ? 'light' : 'dark')
          }
          subtitle="Drag to organize · saved locally"
          title={board.boardTitle}
        />
        <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
        <ColumnPager
          columns={board.columns}
          errorMessage={board.error}
          isLoading={board.isLoading}
          onAddTask={board.columns.length > 0 ? openCreate : undefined}
          onRetry={board.retry}
          onTaskMove={board.moveTask}
          onTaskPress={openEdit}
        />
      </SafeAreaView>

      <AddTaskSheet
        columns={board.columns}
        initialColumnId={initialColumnId}
        initialTask={selectedTask}
        isSubmitting={board.isSubmitting}
        key={editorKey}
        onClose={closeSheet}
        onDelete={selectedTask ? confirmDelete : undefined}
        onSubmit={submitTask}
        visible={sheetVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
});
