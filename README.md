# Flowboard

An offline-first mobile task manager built to showcase engineering decisions beyond the interface: reactive local persistence, gesture interactions, separation of concerns, and a foundation ready to evolve.

## Project status

✅ **Functional local MVP.** The app provides a configurable board with tasks, column management, light/dark themes, and no dependency on a connection or backend.

| Capability | MVP scope |
| --- | --- |
| Tasks | Create, edit, and delete |
| Organization | Configure columns; move tasks and reorder them with drag-and-drop when supported |
| Persistence | Local SQLite database through WatermelonDB |
| Offline | Read and write without a network; data survives app restarts |
| Accessibility | Explicit actions to move tasks without relying on gestures |
| Demo data | Reproducible local seed |
| Remote sync | Not implemented; considered in the roadmap |

## Demo

| Board | Drag-and-drop | Editing |
| --- | --- | --- |
| _Screenshot pending_ | _GIF pending_ | _Screenshot pending_ |

Final assets will be added to `docs/images/`. See the [capture guide](docs/images/README.md).

## Stack

- Expo SDK 57, React Native 0.86, and React 19.2;
- Expo Router for route composition;
- WatermelonDB/SQLite for reactive local persistence;
- React Native Gesture Handler and Reanimated for drag interactions;
- TypeScript in strict mode.

SDK 57 requires **Node.js 22.13.x or later**. See the [versioned Expo SDK 57 reference](https://docs.expo.dev/versions/v57.0.0/).

## Why does it not run in Expo Go?

WatermelonDB contains native code that is not part of the generic Expo Go runtime. Flowboard must therefore run in a **development build** that includes the project's native modules. This decision is recorded in [ADR-001](docs/adr/0001-expo-development-build.md).

## Running locally

### Prerequisites

- Node.js 22.13+;
- npm;
- Xcode 26.4+ for iOS 16.4+, or Android Studio/SDK for Android 7+;
- CocoaPods for the first iOS build.

### Installation

```bash
git clone <your-fork-or-repository-url>
cd kanban-mobile
npm ci
```

Create and install a local development build:

```bash
# iOS
npx expo run:ios

# or Android
npx expo run:android
```

For later sessions, start the bundler for the development client:

```bash
npx expo start --dev-client
```

Changes to native dependencies or configuration require a new development build.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Starts the Expo development server |
| `npm run ios` | Opens the project on iOS |
| `npm run android` | Opens the project on Android |
| `npm run lint` | Runs lint rules |
| `npm run typecheck` | Checks TypeScript types without emitting files |
| `npm test -- --runInBand` | Runs the test suite serially |

Treat `package.json` as the definitive source for available scripts.

## Architecture

The dependency flow keeps UI and storage details at the edges:

```text
routes
  └── features / presentation
        └── hooks / use-cases
              └── repository contract
                    └── WatermelonDB repository
                          └── local SQLite
```

Screens observe local queries, while mutations pass through use cases and repositories. The UI therefore does not know database schema or adapter details. In the MVP, “offline-first” means the local database is the source of truth; it does not imply that remote synchronization already exists.

See [Architecture](docs/architecture.md) and [technical decisions](docs/adr/README.md).

## Quality

Every pull request runs reproducible installation, lint, type checking, and tests in CI. The quality strategy includes:

- strict TypeScript and clear layer boundaries;
- domain rule and ordering tests;
- tests for critical interface flows;
- manual checks in iOS and Android development builds;
- an accessible alternative for every gesture-dependent action.

See [Contributing](CONTRIBUTING.md) for the complete checklist.

## Roadmap

- [x] Deliver the local MVP with CRUD, seed data, and reactive persistence;
- [ ] Expand automated component and repository coverage;
- [ ] Add filters, search, and priorities;
- [ ] Instrument performance for larger lists;
- [ ] Evaluate optional backend synchronization and a conflict policy;
- [ ] Add end-to-end device tests;
- [ ] Publish a video and screenshots of the final experience.

Synchronization is not simply connecting the database to an API: WatermelonDB is a local database and requires a backend compatible with its protocol. This evolution will receive its own ADR and threat model before implementation.

## Documentation

- [Offline-first architecture](docs/architecture.md)
- [ADRs](docs/adr/README.md)
- [How to contribute](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

## License

Distributed under the [MIT](LICENSE) license.
