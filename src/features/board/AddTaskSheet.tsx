import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { BoardColumnModel, BoardTask, TaskTone } from './types';
import { taskTonePalette, useAppTheme } from '@/theme';

export type AddTaskInput = {
  title: string;
  description?: string;
  columnId: string;
  tone: TaskTone;
};

export type AddTaskSheetProps = {
  visible: boolean;
  columns: readonly Pick<BoardColumnModel, 'id' | 'title'>[];
  initialColumnId?: string;
  initialTask?: BoardTask | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (input: AddTaskInput) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

const tones: readonly TaskTone[] = ['mint', 'sky', 'butter', 'peach', 'lilac'];
const toneColors: Record<TaskTone, string> = taskTonePalette;

export function AddTaskSheet({
  visible,
  columns,
  initialColumnId,
  initialTask = null,
  isSubmitting = false,
  onClose,
  onSubmit,
  onDelete,
}: AddTaskSheetProps) {
  const theme = useAppTheme();
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [columnId, setColumnId] = useState(
    initialTask?.columnId ?? initialColumnId ?? columns[0]?.id ?? '',
  );
  const [tone, setTone] = useState<TaskTone>(initialTask?.tone ?? 'mint');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const resetAndClose = () => {
    if (isSubmitting) return;
    setTitle('');
    setDescription('');
    setValidationMessage(null);
    onClose();
  };

  const submit = async () => {
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      setValidationMessage('Give the task a short, clear name.');
      return;
    }
    if (!columnId) {
      setValidationMessage('Choose a column for the task.');
      return;
    }
    setValidationMessage(null);
    try {
      await onSubmit({
        title: normalizedTitle,
        description: description.trim() || undefined,
        columnId,
        tone,
      });
    } catch {
      setValidationMessage('The task could not be saved. Try again.');
    }
  };

  return (
    <Modal animationType="slide" onRequestClose={resetAndClose} presentationStyle="pageSheet" visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { backgroundColor: theme.surface.canvas }]}>
        <View style={[styles.handle, { backgroundColor: theme.border.strong }]} />
        <View style={[styles.header, { borderBottomColor: theme.border.default }]}>
          <Pressable accessibilityRole="button" disabled={isSubmitting} hitSlop={8} onPress={resetAndClose}>
            <Text style={[styles.cancel, { color: theme.text.secondary }]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.heading, { color: theme.text.primary }]}>{initialTask ? 'Edit task' : 'New task'}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isSubmitting}
            hitSlop={8}
            onPress={() => void submit()}>
            <Text style={[styles.save, { color: theme.status.success }, isSubmitting && styles.disabled]}>
              {isSubmitting ? 'Saving…' : initialTask ? 'Save' : 'Create'}
            </Text>
          </Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: theme.text.muted }]}>TITLE</Text>
          <TextInput
            accessibilityLabel="Task title"
            autoFocus
            editable={!isSubmitting}
            maxLength={100}
            onChangeText={(value) => {
              setTitle(value);
              if (validationMessage) setValidationMessage(null);
            }}
            placeholder="What needs to happen?"
            placeholderTextColor={theme.text.subtle}
            returnKeyType="next"
            style={[styles.titleInput, { borderBottomColor: theme.border.input, color: theme.text.primary }]}
            value={title}
          />
          <Text style={[styles.label, { color: theme.text.muted }]}>NOTAS</Text>
          <TextInput
            accessibilityLabel="Task description"
            editable={!isSubmitting}
            multiline
            onChangeText={setDescription}
            placeholder="Context, next steps…"
            placeholderTextColor={theme.text.subtle}
            style={[styles.descriptionInput, { backgroundColor: theme.surface.subtle, color: theme.text.primary }]}
            textAlignVertical="top"
            value={description}
          />
          <Text style={[styles.label, { color: theme.text.muted }]}>COLUMN</Text>
          <View accessibilityRole="radiogroup" style={styles.optionWrap}>
            {columns.map((column) => {
              const selected = column.id === columnId;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  disabled={isSubmitting}
                  key={column.id}
                  onPress={() => setColumnId(column.id)}
                  style={[styles.option, { backgroundColor: theme.surface.muted }, selected && { backgroundColor: theme.text.primary, borderColor: theme.text.primary }]}>
                  <Text style={[styles.optionText, { color: selected ? theme.text.inverse : theme.text.secondary }]}>{column.title}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.label, { color: theme.text.muted }]}>CARD COLOR</Text>
          <View accessibilityRole="radiogroup" style={styles.toneRow}>
            {tones.map((item) => (
              <Pressable
                accessibilityLabel={`Color ${item}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: item === tone }}
                disabled={isSubmitting}
                key={item}
                onPress={() => setTone(item)}
                style={[styles.tone, { backgroundColor: toneColors[item], borderColor: item === tone ? theme.text.primary : theme.surface.canvas }]}
              />
            ))}
          </View>
          {validationMessage ? <Text accessibilityRole="alert" style={[styles.validation, { color: theme.status.danger }]}>{validationMessage}</Text> : null}
          {initialTask && onDelete ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void onDelete()}
              style={({ pressed }) => [styles.deleteButton, { borderColor: theme.status.dangerBorder }, pressed && styles.deleteButtonPressed]}>
              <Text style={[styles.deleteText, { color: theme.status.danger }]}>Delete task</Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  handle: { alignSelf: 'center', borderRadius: 2, height: 4, marginTop: 8, width: 38 },
  header: { alignItems: 'center', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 17 },
  cancel: { fontSize: 15, fontWeight: '600' },
  heading: { fontSize: 17, fontWeight: '800' },
  save: { fontSize: 15, fontWeight: '800' },
  disabled: { opacity: 0.45 },
  form: { padding: 22, paddingBottom: 48 },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8, marginTop: 22 },
  titleInput: { borderBottomWidth: 1, fontSize: 23, fontWeight: '700', paddingHorizontal: 0, paddingVertical: 12 },
  descriptionInput: { borderRadius: 16, fontSize: 15, lineHeight: 21, minHeight: 112, padding: 15 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { borderColor: 'transparent', borderRadius: 17, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9 },
  optionText: { fontSize: 13, fontWeight: '700' },
  toneRow: { flexDirection: 'row', gap: 13 },
  tone: { borderRadius: 20, borderWidth: 3, height: 40, width: 40 },
  validation: { fontSize: 13, fontWeight: '600', marginTop: 20 },
  deleteButton: { alignItems: 'center', borderRadius: 15, borderWidth: 1, marginTop: 34, padding: 14 },
  deleteButtonPressed: { opacity: 0.55 },
  deleteText: { fontSize: 14, fontWeight: '800' },
});
