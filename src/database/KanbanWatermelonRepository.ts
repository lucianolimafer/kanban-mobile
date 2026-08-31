import { Q, type Database, type Model } from '@nozbe/watermelondb';
import { combineLatest, map } from 'rxjs';

import {
  EntityNotFoundError,
  insertAt,
  moveWithin,
  ValidationError,
  type Board,
  type BoardColumn,
  type CreateBoardInput,
  type CreateColumnInput,
  type CreateTaskInput,
  type KanbanRepository,
  type KanbanSnapshot,
  type MoveColumnInput,
  type MoveTaskInput,
  type Task,
  type Unsubscribe,
  type UpdateBoardInput,
  type UpdateColumnInput,
  type UpdateTaskInput,
} from '@/domain';

import { toBoard, toColumn, toSnapshot, toTask } from './mappers';
import type { BoardModel, ColumnModel, TaskModel } from './models';

const DEFAULT_BOARD_COLOR = '#1F6F5C';
const DEFAULT_COLUMN_COLOR = '#E8F2EF';

const byPosition = <T extends { position: number }>(left: T, right: T) =>
  left.position - right.position;

function requiredText(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new ValidationError(`${field} cannot be empty`);
  }
  return normalized;
}

export class KanbanWatermelonRepository implements KanbanRepository {
  constructor(private readonly database: Database) {}

  private get boards() {
    return this.database.get<BoardModel>('boards');
  }

  private get columns() {
    return this.database.get<ColumnModel>('columns');
  }

  private get tasks() {
    return this.database.get<TaskModel>('tasks');
  }

  async listBoards(): Promise<readonly Board[]> {
    const boards = await this.boards.query(Q.sortBy('position', Q.asc)).fetch();
    return boards.map(toBoard);
  }

  async getSnapshot(boardId: string): Promise<KanbanSnapshot> {
    const board = await this.findBoard(boardId);
    const [columns, tasks] = await Promise.all([
      this.columns
        .query(Q.where('board_id', boardId), Q.sortBy('position', Q.asc))
        .fetch(),
      this.tasks
        .query(
          Q.on('columns', 'board_id', boardId),
          Q.sortBy('position', Q.asc),
        )
        .fetch(),
    ]);
    return toSnapshot(board, columns, tasks);
  }

  observeSnapshot(
    boardId: string,
    listener: (snapshot: KanbanSnapshot) => void,
  ): Unsubscribe {
    const board$ = this.boards.findAndObserve(boardId);
    const columns$ = this.columns
      .query(Q.where('board_id', boardId), Q.sortBy('position', Q.asc))
      .observeWithColumns(['title', 'color', 'is_hidden_v2', 'position', 'updated_at']);
    const tasks$ = this.tasks
      .query(Q.on('columns', 'board_id', boardId), Q.sortBy('position', Q.asc))
      .observeWithColumns([
        'column_id',
        'title',
        'description',
        'priority',
        'tone',
        'is_completed',
        'position',
        'due_at',
        'updated_at',
      ]);

    return combineLatest([board$, columns$, tasks$])
      .pipe(map(([board, columns, tasks]) => toSnapshot(board, columns, tasks)))
      .subscribe(listener);
  }

  async createBoard(input: CreateBoardInput): Promise<Board> {
    const title = requiredText(input.title, 'title');
    return this.database.write(async () => {
      const existing = await this.boards.query().fetch();
      const board = await this.boards.create((record) => {
        record.title = title;
        record.color = input.color ?? DEFAULT_BOARD_COLOR;
        record.position = existing.length;
      });
      return toBoard(board);
    });
  }

  async updateBoard(id: string, input: UpdateBoardInput): Promise<Board> {
    return this.database.write(async () => {
      const board = await this.findBoard(id);
      await board.update((record) => {
        if (input.title !== undefined) {
          record.title = requiredText(input.title, 'title');
        }
        if (input.color !== undefined) record.color = input.color;
      });
      return toBoard(board);
    });
  }

  async deleteBoard(id: string): Promise<void> {
    await this.database.write(async () => {
      const board = await this.findBoard(id);
      const [columns, tasks, boards] = await Promise.all([
        this.columns.query(Q.where('board_id', id)).fetch(),
        this.tasks.query(Q.on('columns', 'board_id', id)).fetch(),
        this.boards.query(Q.sortBy('position', Q.asc)).fetch(),
      ]);
      const remaining = boards.filter((item) => item.id !== id);
      await this.database.batch(
        ...tasks.map((task) => task.prepareMarkAsDeleted()),
        ...columns.map((column) => column.prepareMarkAsDeleted()),
        board.prepareMarkAsDeleted(),
        ...this.preparePositions(remaining),
      );
    });
  }

  async createColumn(input: CreateColumnInput): Promise<BoardColumn> {
    const title = requiredText(input.title, 'title');
    return this.database.write(async () => {
      await this.findBoard(input.boardId);
      const current = await this.fetchColumns(input.boardId);
      const index = Math.max(
        0,
        Math.min(input.position ?? current.length, current.length),
      );
      const column = this.columns.prepareCreate((record) => {
        record.boardId = input.boardId;
        record.title = title;
        record.color = input.color ?? DEFAULT_COLUMN_COLOR;
        record.isHidden = !(input.isVisible ?? true);
        record.position = index;
      });
      const reordered = insertAt(current, column, index);
      await this.database.batch(
        column,
        ...this.preparePositions(reordered, column.id),
      );
      return toColumn(column);
    });
  }

  async updateColumn(
    id: string,
    input: UpdateColumnInput,
  ): Promise<BoardColumn> {
    return this.database.write(async () => {
      const column = await this.findColumn(id);
      await column.update((record) => {
        if (input.title !== undefined) {
          record.title = requiredText(input.title, 'title');
        }
        if (input.color !== undefined) record.color = input.color;
        if (input.isVisible !== undefined) record.isHidden = !input.isVisible;
      });
      return toColumn(column);
    });
  }

  async deleteColumn(id: string): Promise<void> {
    await this.database.write(async () => {
      const column = await this.findColumn(id);
      const [tasks, siblings] = await Promise.all([
        this.tasks.query(Q.where('column_id', id)).fetch(),
        this.fetchColumns(column.boardId),
      ]);
      const remaining = siblings.filter((item) => item.id !== id);
      await this.database.batch(
        ...tasks.map((task) => task.prepareMarkAsDeleted()),
        column.prepareMarkAsDeleted(),
        ...this.preparePositions(remaining),
      );
    });
  }

  async moveColumn(input: MoveColumnInput): Promise<void> {
    await this.database.write(async () => {
      const column = await this.findColumn(input.columnId);
      const columns = await this.fetchColumns(column.boardId);
      const fromIndex = columns.findIndex((item) => item.id === column.id);
      const reordered = moveWithin(columns, fromIndex, input.targetIndex);
      await this.database.batch(...this.preparePositions(reordered));
    });
  }

  async createTask(input: CreateTaskInput): Promise<Task> {
    const title = requiredText(input.title, 'title');
    return this.database.write(async () => {
      await this.findColumn(input.columnId);
      const current = await this.fetchTasks(input.columnId);
      const index = Math.max(
        0,
        Math.min(input.position ?? current.length, current.length),
      );
      const task = this.tasks.prepareCreate((record) => {
        record.columnId = input.columnId;
        record.title = title;
        record.description = input.description ?? null;
        record.priority = input.priority ?? 'medium';
        record.tone = input.tone ?? 'mint';
        record.isCompleted = false;
        record.position = index;
        record.dueAt = input.dueAt ?? null;
      });
      const reordered = insertAt(current, task, index);
      await this.database.batch(
        task,
        ...this.preparePositions(reordered, task.id),
      );
      return toTask(task);
    });
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    return this.database.write(async () => {
      const task = await this.findTask(id);
      await task.update((record) => {
        if (input.title !== undefined) {
          record.title = requiredText(input.title, 'title');
        }
        if (input.description !== undefined) {
          record.description = input.description;
        }
        if (input.priority !== undefined) record.priority = input.priority;
        if (input.tone !== undefined) record.tone = input.tone;
        if (input.dueAt !== undefined) record.dueAt = input.dueAt;
        if (input.isCompleted !== undefined) {
          record.isCompleted = input.isCompleted;
        }
      });
      return toTask(task);
    });
  }

  async deleteTask(id: string): Promise<void> {
    await this.database.write(async () => {
      const task = await this.findTask(id);
      const siblings = await this.fetchTasks(task.columnId);
      const remaining = siblings.filter((item) => item.id !== id);
      await this.database.batch(
        task.prepareMarkAsDeleted(),
        ...this.preparePositions(remaining),
      );
    });
  }

  async moveTask(input: MoveTaskInput): Promise<void> {
    await this.database.write(async () => {
      const task = await this.findTask(input.taskId);
      await this.findColumn(input.targetColumnId);
      if (task.columnId === input.targetColumnId) {
        const tasks = await this.fetchTasks(task.columnId);
        const fromIndex = tasks.findIndex((item) => item.id === task.id);
        const reordered = moveWithin(tasks, fromIndex, input.targetIndex);
        await this.database.batch(...this.preparePositions(reordered));
        return;
      }

      const [source, target] = await Promise.all([
        this.fetchTasks(task.columnId),
        this.fetchTasks(input.targetColumnId),
      ]);
      const sourceWithoutTask = source.filter((item) => item.id !== task.id);
      const targetWithTask = insertAt(target, task, input.targetIndex);
      const targetIndex = targetWithTask.findIndex((item) => item.id === task.id);

      await this.database.batch(
        ...this.preparePositions(sourceWithoutTask),
        ...targetWithTask.map((item, index) =>
          item.prepareUpdate((record) => {
            record.position = index;
            if (index === targetIndex) record.columnId = input.targetColumnId;
          }),
        ),
      );
    });
  }

  private async fetchColumns(boardId: string): Promise<ColumnModel[]> {
    const columns = await this.columns
      .query(Q.where('board_id', boardId), Q.sortBy('position', Q.asc))
      .fetch();
    return columns.sort(byPosition);
  }

  private async fetchTasks(columnId: string): Promise<TaskModel[]> {
    const tasks = await this.tasks
      .query(Q.where('column_id', columnId), Q.sortBy('position', Q.asc))
      .fetch();
    return tasks.sort(byPosition);
  }

  private preparePositions<T extends Model & { position: number }>(
    records: readonly T[],
    skipId?: string,
  ): T[] {
    return records.flatMap((record, index) => {
      if (record.id === skipId || record.position === index) return [];
      return [
        record.prepareUpdate((updated) => {
          updated.position = index;
        }),
      ];
    });
  }

  private async findBoard(id: string): Promise<BoardModel> {
    try {
      return await this.boards.find(id);
    } catch {
      throw new EntityNotFoundError('Board', id);
    }
  }

  private async findColumn(id: string): Promise<ColumnModel> {
    try {
      return await this.columns.find(id);
    } catch {
      throw new EntityNotFoundError('Column', id);
    }
  }

  private async findTask(id: string): Promise<TaskModel> {
    try {
      return await this.tasks.find(id);
    } catch {
      throw new EntityNotFoundError('Task', id);
    }
  }
}
