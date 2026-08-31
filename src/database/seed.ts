import { Q, type Database } from '@nozbe/watermelondb';

import type { TaskPriority, TaskTone } from '@/domain';

import type { BoardModel, ColumnModel, TaskModel } from './models';

export const DEMO_BOARD_ID = 'portfolio_demo_board';

const COLUMN_IDS = {
  backlog: 'portfolio_demo_backlog',
  today: 'portfolio_demo_today',
  week: 'portfolio_demo_week',
  done: 'portfolio_demo_done',
} as const;

const LEGACY_DEMO_TEXT: Readonly<Record<string, string>> = {
  'Meu planejamento': 'My plan',
  Ideias: 'Ideas',
  'A fazer': 'To do',
  Fazendo: 'Doing',
  Hoje: 'Today',
  'Esta semana': 'This week',
  Concluído: 'Done',
  Concluido: 'Done',
  'Pesquisar referências do produto': 'Research product references',
  'Reunir padrões úteis de apps de produtividade mobile.':
    'Collect useful patterns from mobile productivity apps.',
  'Refinar escopo do próximo ciclo': 'Refine the next cycle scope',
  'Quebrar os objetivos em entregas pequenas e verificáveis.':
    'Break goals into small, verifiable deliverables.',
  'Revisar fluxo de drag and drop': 'Review the drag-and-drop flow',
  'Validar feedback visual, áreas de drop e acessibilidade.':
    'Validate visual feedback, drop zones, and accessibility.',
  'Testar o modo offline': 'Test offline mode',
  'Criar e mover tarefas sem conexão e reiniciar o app.':
    'Create and move tasks without a connection, then restart the app.',
  'Documentar decisões no README': 'Document decisions in the README',
  'Explicar arquitetura, trade-offs e roteiro de evolução.':
    'Explain the architecture, trade-offs, and evolution roadmap.',
  'Configurar Expo SDK 57': 'Configure Expo SDK 57',
  'Projeto inicial criado e pronto para desenvolvimento.':
    'Initial project created and ready for development.',
};

interface SeedTask {
  readonly id: string;
  readonly columnId: string;
  readonly title: string;
  readonly description: string;
  readonly priority: TaskPriority;
  readonly tone: TaskTone;
  readonly isCompleted?: boolean;
  readonly dueOffsetDays?: number;
}

const TASKS: readonly SeedTask[] = [
  {
    id: 'portfolio_task_research',
    columnId: COLUMN_IDS.backlog,
    title: 'Research product references',
    description: 'Collect useful patterns from mobile productivity apps.',
    priority: 'medium',
    tone: 'sky',
  },
  {
    id: 'portfolio_task_scope',
    columnId: COLUMN_IDS.backlog,
    title: 'Refine the next cycle scope',
    description: 'Break goals into small, verifiable deliverables.',
    priority: 'low',
    tone: 'butter',
  },
  {
    id: 'portfolio_task_wireframe',
    columnId: COLUMN_IDS.today,
    title: 'Review the drag-and-drop flow',
    description: 'Validate visual feedback, drop zones, and accessibility.',
    priority: 'high',
    tone: 'peach',
    dueOffsetDays: 0,
  },
  {
    id: 'portfolio_task_offline',
    columnId: COLUMN_IDS.today,
    title: 'Test offline mode',
    description: 'Create and move tasks without a connection, then restart the app.',
    priority: 'high',
    tone: 'mint',
    dueOffsetDays: 0,
  },
  {
    id: 'portfolio_task_readme',
    columnId: COLUMN_IDS.week,
    title: 'Document decisions in the README',
    description: 'Explain the architecture, trade-offs, and evolution roadmap.',
    priority: 'medium',
    tone: 'lilac',
    dueOffsetDays: 3,
  },
  {
    id: 'portfolio_task_bootstrap',
    columnId: COLUMN_IDS.done,
    title: 'Configure Expo SDK 57',
    description: 'Initial project created and ready for development.',
    priority: 'medium',
    tone: 'mint',
    isCompleted: true,
  },
];

/**
 * Adds portfolio-friendly sample content exactly once.
 *
 * WatermelonDB serializes writers and the whole seed is a single transaction.
 * A stable board ID is the idempotency key; a failed transaction leaves no
 * partial seed to repair on the next launch.
 */
export async function seedDemoBoard(database: Database): Promise<string> {
  return database.write(async () => {
    const boards = database.get<BoardModel>('boards');
    const existingSeed = await boards
      .query(Q.where('id', DEMO_BOARD_ID))
      .fetchCount();
    if (existingSeed > 0) {
      const columns = database.get<ColumnModel>('columns');
      const tasks = database.get<TaskModel>('tasks');
      const [board, existingColumns, existingTasks] = await Promise.all([
        boards.find(DEMO_BOARD_ID),
        columns.query(Q.where('board_id', DEMO_BOARD_ID)).fetch(),
        tasks.query(Q.on('columns', 'board_id', DEMO_BOARD_ID)).fetch(),
      ]);
      const updates = [];
      const boardTitle = LEGACY_DEMO_TEXT[board.title];
      if (boardTitle) {
        updates.push(board.prepareUpdate((record) => { record.title = boardTitle; }));
      }
      existingColumns.forEach((column) => {
        const title = LEGACY_DEMO_TEXT[column.title];
        if (title) updates.push(column.prepareUpdate((record) => { record.title = title; }));
      });
      existingTasks.forEach((task) => {
        const title = LEGACY_DEMO_TEXT[task.title];
        const description = task.description ? LEGACY_DEMO_TEXT[task.description] : undefined;
        if (title || description) {
          updates.push(task.prepareUpdate((record) => {
            if (title) record.title = title;
            if (description) record.description = description;
          }));
        }
      });
      if (updates.length > 0) await database.batch(...updates);
      return DEMO_BOARD_ID;
    }

    const columns = database.get<ColumnModel>('columns');
    const tasks = database.get<TaskModel>('tasks');
    const startOfToday = new Date();
    startOfToday.setHours(12, 0, 0, 0);

    const board = boards.prepareCreate((record) => {
      record._raw.id = DEMO_BOARD_ID;
      record.title = 'My plan';
      record.color = '#1F6F5C';
      record.position = 0;
    });

    const columnDefinitions = [
      [COLUMN_IDS.backlog, 'Ideas', '#E8EEF8'],
      [COLUMN_IDS.today, 'Today', '#E5F3ED'],
      [COLUMN_IDS.week, 'This week', '#FFF1D6'],
      [COLUMN_IDS.done, 'Done', '#EEE9F8'],
    ] as const;

    const columnRecords = columnDefinitions.map(
      ([id, title, color], position) =>
        columns.prepareCreate((record) => {
          record._raw.id = id;
          record.boardId = DEMO_BOARD_ID;
          record.title = title;
          record.color = color;
          record.isHidden = false;
          record.position = position;
        }),
    );

    const positions = new Map<string, number>();
    const taskRecords = TASKS.map((definition) =>
      tasks.prepareCreate((record) => {
        const position = positions.get(definition.columnId) ?? 0;
        positions.set(definition.columnId, position + 1);
        record._raw.id = definition.id;
        record.columnId = definition.columnId;
        record.title = definition.title;
        record.description = definition.description;
        record.priority = definition.priority;
        record.tone = definition.tone;
        record.isCompleted = definition.isCompleted ?? false;
        record.position = position;
        record.dueAt =
          definition.dueOffsetDays === undefined
            ? null
            : new Date(
                startOfToday.getTime() +
                  definition.dueOffsetDays * 24 * 60 * 60 * 1_000,
              );
      }),
    );

    await database.batch(board, ...columnRecords, ...taskRecords);
    return DEMO_BOARD_ID;
  });
}
