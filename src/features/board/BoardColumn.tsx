import { Droppable, useDraggableActiveId } from "@mgcrea/react-native-dnd";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FeedbackState } from "@/components/primitives/FeedbackState";
import { useAppTheme } from "@/theme";

import { TaskCard } from "./TaskCard";
import type { BoardColumnModel, BoardTask, TaskMoveHandler } from "./types";

export type BoardColumnProps = {
  column: BoardColumnModel;
  allColumns?: readonly Pick<BoardColumnModel, "id" | "title">[];
  onAddTask?: (columnId: string) => void;
  onTaskPress?: (task: BoardTask) => void;
  onTaskMove?: TaskMoveHandler;
  dragEnabled?: boolean;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  width?: number;
};

export function BoardColumn({
  column,
  allColumns = [],
  onAddTask,
  onTaskPress,
  onTaskMove,
  dragEnabled = true,
  collapsed = false,
  onToggleCollapsed,
  width = 300,
}: BoardColumnProps) {
  const theme = useAppTheme();
  const dropZoneColor = theme.surface.dropZone;
  const activeDropZoneColor = theme.surface.dropZoneActive;
  const dropZoneBorder = theme.border.default;
  const fallbackAccent = theme.text.primary;
  const activeTaskId = useDraggableActiveId();
  const containsActiveTask = column.tasks.some(
    (task) => task.id === activeTaskId,
  );

  if (collapsed) {
    return (
      <View
        style={[
          styles.frame,
          styles.collapsedFrame,
          containsActiveTask && styles.activeFrame,
        ]}
      >
        <Droppable
          data={{ columnId: column.id }}
          id={column.id}
          key={`${column.id}-${theme.colorScheme}-collapsed`}
          style={[
            styles.collapsedDropZone,
            {
              backgroundColor: dropZoneColor,
              borderColor: dropZoneBorder,
              borderWidth: 1,
            },
          ]}
          animatedStyleWorklet={(style, { isActive }) => {
            "worklet";
            return {
              ...style,
              backgroundColor: isActive ? activeDropZoneColor : dropZoneColor,
              borderColor: isActive
                ? (column.accentColor ?? fallbackAccent)
                : dropZoneBorder,
              borderWidth: isActive ? 2 : 1,
            };
          }}
        >
          <Pressable
            accessibilityLabel={`Expand ${column.title} column`}
            accessibilityRole="button"
            onPress={onToggleCollapsed}
            style={({ pressed }) => [
              styles.collapsedButton,
              pressed && styles.controlPressed,
            ]}
          >
            <Text style={[styles.expandIcon, { color: theme.text.secondary }]}>›</Text>
            <View
              style={[
                styles.collapsedAccent,
                { backgroundColor: column.accentColor ?? theme.text.primary },
              ]}
            />
            <Text numberOfLines={3} style={[styles.collapsedTitle, { color: theme.text.primary }]}>
              {column.title}
            </Text>
            <View
              accessibilityLabel={`${column.tasks.length} tasks`}
              style={[styles.count, { backgroundColor: theme.surface.muted }]}
            >
              <Text style={[styles.countText, { color: theme.text.secondary }]}>{column.tasks.length}</Text>
            </View>
          </Pressable>
        </Droppable>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.frame,
        { width },
        containsActiveTask && styles.activeFrame,
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.accent,
            { backgroundColor: column.accentColor ?? theme.text.primary },
          ]}
        />
        <View style={styles.headerCopy}>
          {column.eyebrow ? (
            <Text style={[styles.eyebrow, { color: theme.text.subtle }]}>{column.eyebrow}</Text>
          ) : null}
          <Text numberOfLines={1} style={[styles.title, { color: theme.text.primary }]}>
            {column.title}
          </Text>
        </View>
        <View
          accessibilityLabel={`${column.tasks.length} tasks`}
          style={[styles.count, { backgroundColor: theme.surface.muted }]}
        >
          <Text style={[styles.countText, { color: theme.text.secondary }]}>{column.tasks.length}</Text>
        </View>
        <Pressable
          accessibilityLabel={`Collapse ${column.title} column`}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onToggleCollapsed}
          style={({ pressed }) => [
            styles.collapseButton,
            { backgroundColor: theme.surface.subtle },
            pressed && styles.controlPressed,
          ]}
        >
          <Text style={[styles.collapseIcon, { color: theme.text.secondary }]}>−</Text>
        </Pressable>
      </View>

      <Droppable
        data={{ columnId: column.id }}
        id={column.id}
        key={`${column.id}-${theme.colorScheme}-expanded`}
        style={[
          styles.dropZone,
          {
            backgroundColor: dropZoneColor,
            borderColor: dropZoneBorder,
            borderWidth: 1,
          },
        ]}
        animatedStyleWorklet={(style, { isActive }) => {
          "worklet";
          return {
            ...style,
            backgroundColor: isActive ? activeDropZoneColor : dropZoneColor,
            borderColor: isActive
              ? (column.accentColor ?? fallbackAccent)
              : dropZoneBorder,
            borderWidth: isActive ? 2 : 1,
            transform: [{ scale: isActive ? 1.012 : 1 }],
          };
        }}
      >
        {column.tasks.length > 0 ? (
          column.tasks.map((task) => (
            <TaskCard
              columns={allColumns}
              dragEnabled={dragEnabled}
              key={task.id}
              onMove={onTaskMove}
              onPress={onTaskPress}
              task={task}
            />
          ))
        ) : (
          <FeedbackState
            actionLabel={onAddTask ? "Create task" : undefined}
            compact
            kind="empty"
            message="Drop a card here or create the first task."
            onAction={onAddTask ? () => onAddTask(column.id) : undefined}
          />
        )}
      </Droppable>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginRight: 14,
    overflow: "visible",
    position: "relative",
    zIndex: 0,
  },
  activeFrame: { elevation: 24, zIndex: 1000 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    minHeight: 56,
    paddingHorizontal: 4,
  },
  accent: { borderRadius: 3, height: 30, width: 5 },
  headerCopy: { flex: 1 },
  eyebrow: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.35,
  },
  count: {
    alignItems: "center",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    minWidth: 26,
    paddingHorizontal: 7,
  },
  countText: { fontSize: 11, fontWeight: "800" },
  collapseButton: {
    alignItems: "center",
    borderRadius: 14,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  collapseIcon: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 21,
  },
  controlPressed: { opacity: 0.55 },
  dropZone: {
    borderRadius: 22,
    minHeight: 430,
    overflow: "visible",
    padding: 10,
  },
  collapsedFrame: { width: 72 },
  collapsedDropZone: { borderRadius: 22, minHeight: 430, overflow: "hidden" },
  collapsedButton: {
    alignItems: "center",
    flex: 1,
    gap: 14,
    minHeight: 430,
    paddingHorizontal: 8,
    paddingVertical: 14,
  },
  expandIcon: {
    fontSize: 28,
    fontWeight: "500",
    lineHeight: 30,
  },
  collapsedAccent: { borderRadius: 3, height: 5, width: 30 },
  collapsedTitle: {
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
  },
});
