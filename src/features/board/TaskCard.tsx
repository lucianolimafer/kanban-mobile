import { Draggable } from "@mgcrea/react-native-dnd";
import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { taskTonePalette, useAppTheme } from "@/theme";

import type {
  BoardColumnModel,
  BoardTask,
  TaskMoveHandler,
  TaskTone,
} from "./types";

const toneColors: Record<TaskTone, string> = taskTonePalette;

export type TaskCardProps = {
  task: BoardTask;
  columns?: readonly Pick<BoardColumnModel, "id" | "title">[];
  onPress?: (task: BoardTask) => void;
  onMove?: TaskMoveHandler;
  dragEnabled?: boolean;
};

export function TaskCard({
  task,
  columns = [],
  onPress,
  onMove,
  dragEnabled = true,
}: TaskCardProps) {
  const theme = useAppTheme();
  const [moveMenuVisible, setMoveMenuVisible] = useState(false);
  const targetColumns = columns.filter((column) => column.id !== task.columnId);
  const backgroundColor = toneColors[task.tone ?? "mint"];

  const card = (
    <Pressable
      accessibilityActions={[
        { name: "activate", label: "Open task" },
        ...(targetColumns.length > 0
          ? [{ name: "longpress", label: "Move task" }]
          : []),
      ]}
      accessibilityHint={
        dragEnabled
          ? "Touch and hold to drag. Use the move button as an alternative."
          : undefined
      }
      accessibilityLabel={`${task.title}${task.dueLabel ? `, ${task.dueLabel}` : ""}`}
      accessibilityRole="button"
      delayLongPress={650}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "activate") onPress?.(task);
        if (event.nativeEvent.actionName === "longpress")
          setMoveMenuVisible(true);
      }}
      onLongPress={() => {
        if (!dragEnabled && targetColumns.length > 0) setMoveMenuVisible(true);
      }}
      onPress={() => onPress?.(task)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor, borderColor: theme.border.default, shadowColor: theme.shadow.card },
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        {task.label ? <Text style={[styles.label, { color: theme.taskToneContent.secondary }]}>{task.label}</Text> : <View />}
        {targetColumns.length > 0 ? (
          <Pressable
            accessibilityLabel={`Move ${task.title}`}
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setMoveMenuVisible(true)}
            style={styles.moveButton}
          >
            <Text style={[styles.moveButtonText, { color: theme.taskToneContent.secondary }]}>•••</Text>
          </Pressable>
        ) : null}
      </View>
      <Text numberOfLines={2} style={[styles.title, { color: theme.taskToneContent.primary }]}>
        {task.title}
      </Text>
      {task.description ? (
        <Text numberOfLines={2} style={[styles.description, { color: theme.taskToneContent.secondary }]}>
          {task.description}
        </Text>
      ) : null}
      <View style={styles.metaRow}>
        {task.dueLabel ? (
          <Text style={[styles.due, { color: theme.taskToneContent.secondary }]}>◷ {task.dueLabel}</Text>
        ) : (
          <View />
        )}
        {task.assigneeInitials ? (
          <View
            accessibilityLabel={`Assignee ${task.assigneeInitials}`}
            style={[styles.avatar, { backgroundColor: theme.taskToneContent.avatar }]}
          >
            <Text style={[styles.avatarText, { color: theme.taskToneContent.primary }]}>{task.assigneeInitials}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <>
      {dragEnabled ? (
        <Draggable
          data={{ columnId: task.columnId, taskId: task.id }}
          id={task.id}
          style={styles.draggable}
          animatedStyleWorklet={(style, { isActive }) => {
            "worklet";
            return {
              ...style,
              opacity: isActive ? 0.94 : 1,
              elevation: isActive ? 14 : 0,
              shadowOpacity: isActive ? 0.2 : 0,
              shadowRadius: isActive ? 14 : 0,
              zIndex: isActive ? 50 : 1,
            };
          }}
        >
          {card}
        </Draggable>
      ) : (
        card
      )}

      <Modal
        animationType="fade"
        onRequestClose={() => setMoveMenuVisible(false)}
        transparent
        visible={moveMenuVisible}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => setMoveMenuVisible(false)}
          style={[styles.backdrop, { backgroundColor: theme.overlay }]}
        >
          <Pressable
            accessibilityRole="menu"
            onPress={(event) => event.stopPropagation()}
            style={[styles.menu, { backgroundColor: theme.surface.canvas }]}
          >
            <Text style={[styles.menuEyebrow, { color: theme.text.subtle }]}>MOVE TASK</Text>
            <Text numberOfLines={2} style={[styles.menuTitle, { color: theme.text.primary }]}>
              {task.title}
            </Text>
            {targetColumns.map((column) => (
              <Pressable
                accessibilityRole="menuitem"
                key={column.id}
                onPress={() => {
                  setMoveMenuVisible(false);
                  onMove?.(task.id, column.id);
                }}
                style={({ pressed }) => [
                  styles.menuItem,
                  { borderTopColor: theme.border.default },
                  pressed && styles.menuItemPressed,
                ]}
              >
                <Text style={[styles.menuItemText, { color: theme.text.primary }]}>{column.title}</Text>
                <Text style={[styles.menuArrow, { color: theme.text.secondary }]}>→</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  draggable: { marginBottom: 12 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 142,
    padding: 16,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardPressed: { opacity: 0.8 },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 22,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  moveButton: {
    alignItems: "center",
    height: 24,
    justifyContent: "center",
    width: 30,
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.25,
    lineHeight: 21,
    marginTop: 5,
  },
  description: { fontSize: 12, lineHeight: 17, marginTop: 5 },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
    paddingTop: 13,
  },
  due: { fontSize: 11, fontWeight: "600" },
  avatar: {
    alignItems: "center",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  avatarText: { fontSize: 9, fontWeight: "800" },
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 14,
  },
  menu: {
    borderRadius: 26,
    padding: 22,
    paddingBottom: 28,
  },
  menuEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
    marginTop: 4,
  },
  menuItem: {
    alignItems: "center",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 52,
  },
  menuItemPressed: { opacity: 0.52 },
  menuItemText: { fontSize: 16, fontWeight: "600" },
  menuArrow: { fontSize: 20 },
});
