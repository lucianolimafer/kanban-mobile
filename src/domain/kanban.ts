export type EntityId = string;

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskTone = 'mint' | 'sky' | 'butter' | 'peach' | 'lilac';

export interface Board {
  readonly id: EntityId;
  readonly title: string;
  readonly color: string;
  readonly position: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface BoardColumn {
  readonly id: EntityId;
  readonly boardId: EntityId;
  readonly title: string;
  readonly color: string;
  readonly isVisible: boolean;
  readonly position: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface Task {
  readonly id: EntityId;
  readonly columnId: EntityId;
  readonly title: string;
  readonly description: string | null;
  readonly priority: TaskPriority;
  readonly tone: TaskTone;
  readonly isCompleted: boolean;
  readonly position: number;
  readonly dueAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface KanbanSnapshot {
  readonly board: Board;
  readonly columns: readonly (BoardColumn & { readonly tasks: readonly Task[] })[];
}

export interface CreateBoardInput {
  readonly title: string;
  readonly color?: string;
}

export interface UpdateBoardInput {
  readonly title?: string;
  readonly color?: string;
}

export interface CreateColumnInput {
  readonly boardId: EntityId;
  readonly title: string;
  readonly color?: string;
  readonly isVisible?: boolean;
  readonly position?: number;
}

export interface UpdateColumnInput {
  readonly title?: string;
  readonly color?: string;
  readonly isVisible?: boolean;
}

export interface CreateTaskInput {
  readonly columnId: EntityId;
  readonly title: string;
  readonly description?: string | null;
  readonly priority?: TaskPriority;
  readonly tone?: TaskTone;
  readonly dueAt?: Date | null;
  readonly position?: number;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string | null;
  readonly priority?: TaskPriority;
  readonly tone?: TaskTone;
  readonly dueAt?: Date | null;
  readonly isCompleted?: boolean;
}

export interface MoveTaskInput {
  readonly taskId: EntityId;
  readonly targetColumnId: EntityId;
  readonly targetIndex: number;
}

export interface MoveColumnInput {
  readonly columnId: EntityId;
  readonly targetIndex: number;
}

export interface Unsubscribe {
  unsubscribe(): void;
}

export interface KanbanRepository {
  listBoards(): Promise<readonly Board[]>;
  getSnapshot(boardId: EntityId): Promise<KanbanSnapshot>;
  observeSnapshot(
    boardId: EntityId,
    listener: (snapshot: KanbanSnapshot) => void,
  ): Unsubscribe;
  createBoard(input: CreateBoardInput): Promise<Board>;
  updateBoard(id: EntityId, input: UpdateBoardInput): Promise<Board>;
  deleteBoard(id: EntityId): Promise<void>;
  createColumn(input: CreateColumnInput): Promise<BoardColumn>;
  updateColumn(id: EntityId, input: UpdateColumnInput): Promise<BoardColumn>;
  deleteColumn(id: EntityId): Promise<void>;
  moveColumn(input: MoveColumnInput): Promise<void>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: EntityId, input: UpdateTaskInput): Promise<Task>;
  deleteTask(id: EntityId): Promise<void>;
  moveTask(input: MoveTaskInput): Promise<void>;
}
