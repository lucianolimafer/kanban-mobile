import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FeedbackState } from '@/components/primitives/FeedbackState';
import { IconButton } from '@/components/primitives/IconButton';
import { columnColorPalette, useAppTheme } from '@/theme';
import {
  type ConfigurableColumn,
  useKanbanBoard,
} from '@/hooks/use-kanban-board';

const COLUMN_COLORS = columnColorPalette;

type ColumnEditorProps = {
  column: ConfigurableColumn;
  index: number;
  total: number;
  visibleCount: number;
  disabled: boolean;
  onDelete: () => void;
  onMove: (targetIndex: number) => void;
  onUpdate: (input: { title?: string; color?: string; isVisible?: boolean }) => Promise<unknown>;
};

function ColumnEditor({
  column,
  index,
  total,
  visibleCount,
  disabled,
  onDelete,
  onMove,
  onUpdate,
}: ColumnEditorProps) {
  const theme = useAppTheme();
  const [title, setTitle] = useState(column.title);

  const saveTitle = () => {
    const normalized = title.trim();
    if (!normalized) {
      setTitle(column.title);
      return;
    }
    if (normalized !== column.title) void onUpdate({ title: normalized });
  };

  const visibilityLocked = column.isVisible && visibleCount <= 1;

  return (
    <View style={[styles.columnCard, { backgroundColor: theme.surface.raised, borderColor: theme.border.default }, !column.isVisible && styles.columnCardHidden]}>
      <View style={styles.columnTopRow}>
        <View style={[styles.columnAccent, { backgroundColor: column.color }]} />
        <View style={styles.columnHeading}>
          <Text style={[styles.columnPosition, { color: theme.text.subtle }]}>COLUMN {index + 1}</Text>
          <Text style={[styles.taskCount, { color: theme.text.secondary }]}>{column.taskCount} tasks</Text>
        </View>
        <View style={styles.orderControls}>
          <Pressable
            accessibilityLabel={`Move ${column.title} left`}
            disabled={disabled || index === 0}
            onPress={() => onMove(index - 1)}
            style={({ pressed }) => [
              styles.orderButton, { backgroundColor: theme.surface.subtle },
              (disabled || index === 0) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.orderIcon, { color: theme.text.primary }]}>‹</Text>
          </Pressable>
          <Pressable
            accessibilityLabel={`Move ${column.title} right`}
            disabled={disabled || index === total - 1}
            onPress={() => onMove(index + 1)}
            style={({ pressed }) => [
              styles.orderButton, { backgroundColor: theme.surface.subtle },
              (disabled || index === total - 1) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.orderIcon, { color: theme.text.primary }]}>›</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.fieldLabel, { color: theme.text.subtle }]}>NAME</Text>
      <TextInput
        accessibilityLabel={`${column.title} column name`}
        editable={!disabled}
        maxLength={40}
        onBlur={saveTitle}
        onChangeText={setTitle}
        onSubmitEditing={saveTitle}
        returnKeyType="done"
        style={[styles.nameInput, { borderBottomColor: theme.border.input, color: theme.text.primary }]}
        value={title}
      />

      <Text style={[styles.fieldLabel, { color: theme.text.subtle }]}>COLOR</Text>
      <View accessibilityRole="radiogroup" style={styles.palette}>
        {COLUMN_COLORS.map((color) => (
          <Pressable
            accessibilityLabel={`Use color ${color} for ${column.title}`}
            accessibilityRole="radio"
            accessibilityState={{ checked: color === column.color }}
            disabled={disabled}
            key={color}
            onPress={() => void onUpdate({ color })}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              { borderColor: color === column.color ? theme.text.primary : theme.surface.raised },
            ]}
          />
        ))}
      </View>

      <View style={[styles.visibilityRow, { borderTopColor: theme.border.default }]}>
        <View style={styles.visibilityCopy}>
          <Text style={[styles.visibilityTitle, { color: theme.text.primary }]}>Show on board</Text>
          <Text style={[styles.visibilityHint, { color: theme.text.muted }]}>
            {visibilityLocked
              ? 'At least one column must remain visible.'
              : 'Hiding a column does not delete its tasks.'}
          </Text>
        </View>
        <Switch
          accessibilityLabel={`Show ${column.title} column on the board`}
          disabled={disabled || visibilityLocked}
          onValueChange={(isVisible) => void onUpdate({ isVisible })}
          trackColor={{ false: theme.border.strong, true: theme.status.success }}
          value={column.isVisible}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={disabled || total <= 1 || visibilityLocked}
        onPress={onDelete}
        style={({ pressed }) => [
          styles.deleteButton,
          (disabled || total <= 1 || visibilityLocked) && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.deleteText, { color: theme.status.danger }]}>Delete column</Text>
      </Pressable>
    </View>
  );
}

export default function ColumnsSettingsScreen() {
  const board = useKanbanBoard();
  const theme = useAppTheme();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState<string>(COLUMN_COLORS[1]);
  const visibleCount = board.configurableColumns.filter((column) => column.isVisible).length;

  const createColumn = async () => {
    const title = newTitle.trim();
    if (!title) return;
    await board.createColumn(title, newColor);
    setNewTitle('');
    setNewColor(COLUMN_COLORS[1]);
    setCreating(false);
  };

  const confirmDelete = (column: ConfigurableColumn) => {
    const taskWarning = column.taskCount > 0
      ? ` This column contains ${column.taskCount} tasks, which will also be deleted.`
      : '';
    Alert.alert(
      'Delete column?',
      `“${column.title}” will be permanently removed.${taskWarning}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void board.deleteColumn(column.id),
        },
      ],
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.surface.page }]}>
      <StatusBar style={theme.colorScheme === 'dark' ? 'light' : 'dark'} />
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
        <View style={styles.header}>
          <IconButton accessibilityLabel="Back to settings" icon="‹" onPress={() => router.back()} />
          <View style={styles.headerCopy}>
            <Text style={[styles.eyebrow, { color: theme.text.subtle }]}>ORGANIZATION</Text>
            <Text numberOfLines={1} style={[styles.title, { color: theme.text.primary }]}>Manage columns</Text>
          </View>
          <Pressable
            accessibilityLabel="Create column"
            accessibilityRole="button"
            disabled={board.isSubmitting}
            onPress={() => setCreating(true)}
            style={({ pressed }) => [styles.addButton, { backgroundColor: theme.text.primary }, pressed && styles.pressed]}>
            <Text style={[styles.addButtonText, { color: theme.text.inverse }]}>+</Text>
          </Pressable>
        </View>

        {board.isLoading ? <FeedbackState kind="loading" /> : (
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={[styles.summary, { backgroundColor: theme.status.successSoft }]}>
              <Text style={[styles.summaryValue, { color: theme.status.success }]}>{visibleCount}</Text>
              <View style={styles.summaryCopy}>
                <Text style={[styles.summaryTitle, { color: theme.status.successText }]}>visible columns</Text>
                <Text style={[styles.summaryHint, { color: theme.text.secondary }]}>
                  of {board.configurableColumns.length} configured on the board
                </Text>
              </View>
            </View>

            {board.error ? <Text accessibilityRole="alert" style={[styles.error, { backgroundColor: theme.status.dangerSoft, color: theme.status.danger }]}>{board.error}</Text> : null}

            {creating ? (
              <View style={[styles.createCard, { backgroundColor: theme.surface.raised, borderColor: theme.border.strong }]}>
                <Text style={[styles.createTitle, { color: theme.text.primary }]}>New column</Text>
                <TextInput
                  accessibilityLabel="New column name"
                  autoFocus
                  editable={!board.isSubmitting}
                  maxLength={40}
                  onChangeText={setNewTitle}
                  placeholder="Example: In review"
                  placeholderTextColor={theme.text.subtle}
                  returnKeyType="done"
                  style={[styles.nameInput, { borderBottomColor: theme.border.input, color: theme.text.primary }]}
                  value={newTitle}
                />
                <View accessibilityRole="radiogroup" style={styles.palette}>
                  {COLUMN_COLORS.map((color) => (
                    <Pressable
                      accessibilityLabel={`Use color ${color}`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: color === newColor }}
                      key={color}
                      onPress={() => setNewColor(color)}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        { borderColor: color === newColor ? theme.text.primary : theme.surface.raised },
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.createActions}>
                  <Pressable
                    disabled={board.isSubmitting}
                    onPress={() => {
                      setCreating(false);
                      setNewTitle('');
                    }}
                    style={({ pressed }) => [styles.secondaryButton, { borderColor: theme.border.strong }, pressed && styles.pressed]}>
                    <Text style={[styles.secondaryButtonText, { color: theme.text.secondary }]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    disabled={board.isSubmitting || !newTitle.trim()}
                    onPress={() => void createColumn()}
                    style={({ pressed }) => [
                      styles.primaryButton, { backgroundColor: theme.text.primary },
                      (board.isSubmitting || !newTitle.trim()) && styles.disabled,
                      pressed && styles.pressed,
                    ]}>
                    <Text style={[styles.primaryButtonText, { color: theme.text.inverse }]}>
                      {board.isSubmitting ? 'Creating…' : 'Create column'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>BOARD COLUMNS</Text>
            {board.configurableColumns.map((column, index) => (
              <ColumnEditor
                column={column}
                disabled={board.isSubmitting}
                index={index}
                key={column.id}
                onDelete={() => confirmDelete(column)}
                onMove={(targetIndex) => void board.moveColumn(column.id, targetIndex)}
                onUpdate={(input) => board.updateColumn(column.id, input)}
                total={board.configurableColumns.length}
                visibleCount={visibleCount}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  safeArea: { flex: 1 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 16 },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8, marginTop: 2 },
  addButton: { alignItems: 'center', borderRadius: 23, height: 46, justifyContent: 'center', width: 46 },
  addButtonText: { fontSize: 28, fontWeight: '400', lineHeight: 30 },
  content: { gap: 14, paddingBottom: 36, paddingHorizontal: 18 },
  summary: { alignItems: 'center', borderRadius: 22, flexDirection: 'row', gap: 14, padding: 18 },
  summaryValue: { fontSize: 34, fontWeight: '900' },
  summaryCopy: { flex: 1 },
  summaryTitle: { fontSize: 16, fontWeight: '800' },
  summaryHint: { fontSize: 12, marginTop: 2 },
  error: { borderRadius: 14, fontSize: 13, fontWeight: '600', padding: 13 },
  sectionTitle: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginLeft: 4, marginTop: 8 },
  columnCard: { borderRadius: 22, borderWidth: 1, padding: 17 },
  columnCardHidden: { opacity: 0.72 },
  columnTopRow: { alignItems: 'center', flexDirection: 'row', gap: 10 },
  columnAccent: { borderRadius: 3, height: 34, width: 6 },
  columnHeading: { flex: 1 },
  columnPosition: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  taskCount: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  orderControls: { flexDirection: 'row', gap: 7 },
  orderButton: { alignItems: 'center', borderRadius: 15, height: 30, justifyContent: 'center', width: 34 },
  orderIcon: { fontSize: 24, lineHeight: 25 },
  fieldLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 16 },
  nameInput: { borderBottomWidth: 1, fontSize: 18, fontWeight: '700', paddingHorizontal: 0, paddingVertical: 9 },
  palette: { flexDirection: 'row', gap: 10 },
  colorOption: { borderRadius: 17, borderWidth: 3, height: 34, width: 34 },
  visibilityRow: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', marginTop: 18, paddingTop: 15 },
  visibilityCopy: { flex: 1, paddingRight: 12 },
  visibilityTitle: { fontSize: 14, fontWeight: '700' },
  visibilityHint: { fontSize: 11, lineHeight: 15, marginTop: 2 },
  deleteButton: { alignItems: 'center', marginTop: 13, paddingVertical: 8 },
  deleteText: { fontSize: 12, fontWeight: '700' },
  createCard: { borderRadius: 22, borderStyle: 'dashed', borderWidth: 1, padding: 18 },
  createTitle: { fontSize: 18, fontWeight: '800' },
  createActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end', marginTop: 18 },
  secondaryButton: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 10 },
  secondaryButtonText: { fontSize: 13, fontWeight: '700' },
  primaryButton: { borderRadius: 16, paddingHorizontal: 17, paddingVertical: 10 },
  primaryButtonText: { fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.62 },
  disabled: { opacity: 0.35 },
});
