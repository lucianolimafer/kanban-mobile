export type TaskTone = 'mint' | 'sky' | 'butter' | 'peach' | 'lilac';

export type BoardTask = {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  label?: string;
  dueLabel?: string;
  assigneeInitials?: string;
  tone?: TaskTone;
};

export type BoardColumnModel = {
  id: string;
  title: string;
  eyebrow?: string;
  accentColor?: string;
  tasks: readonly BoardTask[];
};

export type TaskMoveHandler = (taskId: string, targetColumnId: string) => void;

