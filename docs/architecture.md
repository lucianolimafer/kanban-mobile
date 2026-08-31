# Architecture

## Context

Flowboard is a mobile task-management demo. The MVP prioritizes immediate feedback and complete offline operation. This phase has no authentication, API, or remote synchronization.

## Principles

1. **Local is the source of truth:** every relevant read and mutation happens in the local database first.
2. **Reactive UI:** screens observe WatermelonDB queries instead of maintaining parallel copies of persisted state.
3. **Dependencies point inward:** domain rules do not import components or SQLite adapter details.
4. **Gestures are an enhancement:** moving a task must remain possible through accessible controls.
5. **Migrations are production code:** schema changes preserve data and receive tests.

## Layers

| Layer | Responsibility | Must not know |
| --- | --- | --- |
| Routes | Entry points and navigation | Database schema |
| Feature/presentation | Rendering, feedback, and ephemeral interaction state | SQLite adapter |
| Hooks/use cases | Flow coordination and invariants | Visual components |
| Repository contract | Operations required by the domain | Navigation |
| WatermelonDB repository | Queries, writes, batches, and model mapping | Screen layout |
| Database | Schema, models, migrations, and adapter | Presentation rules |

## Main flows

### Loading the board

1. A route mounts the board feature.
2. A hook subscribes to the task query.
3. The repository queries WatermelonDB.
4. Local changes update the subscription and the UI reacts.

### Creating or editing

1. The presentation layer validates the form at the interaction level.
2. The use case normalizes data and applies invariants.
3. The repository runs the mutation in a WatermelonDB writer.
4. The observed query delivers the new state to the screen.

### Dragging a task

1. Gesture Handler recognizes the gesture; Reanimated maintains feedback on the UI thread.
2. After a valid drop, the presentation layer converts the position into a column and order.
3. The use case validates the transition.
4. The repository persists the column and position locally.
5. A canceled or invalid drop persists no mutation.

An explicit “Move to…” action provides the same outcome for keyboards, screen readers, and people who do not use drag-and-drop.

## Local model

The schema contains boards, columns, and tasks. A task stores a title, optional description, priority, completion status, column, position, due date, and timestamps, among other fields. Demo data is created by an idempotent seed, while the interface supports column management. The versioned schema and code migrations are definitive; this document describes only the conceptual contract.

Ordering uses a persisted, deterministic key. Reordering updates must be atomic so the app never observes two conflicting final positions.

## Offline-first versus sync

In the MVP:

- there is no network dependency;
- the app starts, reads, and writes offline;
- restarting the process does not lose tasks;
- there is no pending-upload state, account, or conflict resolution.

WatermelonDB offers synchronization primitives but requires a compatible backend. A future implementation must define identity, authentication, protocol, deletions, idempotency, conflicts, observability, and privacy before changing this design.

## Native adapter

On Expo SDK 57 / React Native 0.86, the app uses the WatermelonDB 0.28 NativeModule bridge (`jsi: false`). Modern autolinking discovers WatermelonDB and `simdjson` on iOS and the Android package without a legacy config plugin. This avoids old JSI host hooks while retaining native SQLite and the repository's asynchronous interface. The JSI adapter should only be adopted after explicit compatibility with the current React Native version and measurements that justify the change.

## Failures and consistency

- Related writes must be grouped in transactions or batches.
- Persistence failures must preserve the previous state and provide recoverable feedback.
- The seed must be idempotent: running it again does not duplicate tasks.
- Schema changes require a migration; deleting the database is not an upgrade strategy.
- Development logs should not contain task descriptions without a clear need.

## Quality and observability

- Use cases test creation, editing, deletion, transitions, and ordering.
- Repositories test queries and atomicity with appropriate infrastructure.
- Components test empty, loading, and error states plus accessible actions.
- The drag flow requires manual validation on iOS and Android in addition to automated tests for the resulting rule.

## References

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [WatermelonDB — Installation](https://watermelondb.dev/docs/Installation)
- [WatermelonDB — Synchronization](https://watermelondb.dev/docs/Sync/Intro)
