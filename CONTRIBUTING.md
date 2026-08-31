# Contributing to Flowboard

Thank you for considering a contribution. Small, focused discussions are easier to review and maintain.

By participating, follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Environment

1. Use Node.js 22.13 or later.
2. Create a fork and a descriptively named branch.
3. Run `npm ci`.
4. Create a development build with `npx expo run:ios` or `npx expo run:android`.
5. Start later sessions with `npx expo start --dev-client`.

Expo Go does not include WatermelonDB's native module and is not a supported target.

## Contribution workflow

1. Open an issue for broad product, schema, or architecture changes.
2. Keep domain rules out of visual components.
3. Include a migration and upgrade test for schema changes.
4. Preserve or add an accessible alternative for gesture actions.
5. Update documentation and ADRs when an architectural decision changes.
6. Do not include secrets, credentials, builds, or real user data.

## Local checks

Before opening a pull request:

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

Also validate the changed flow manually on at least one native platform. Check gesture, responsive layout, or native integration changes on both iOS and Android whenever possible.

## Commits and pull requests

- Prefer small commits with imperative messages and one intention per commit.
- Explain the problem, solution, and trade-offs in the PR.
- Include test steps and visual evidence for UI changes.
- Call out migrations, breaking changes, and known limitations.
- Do not claim unverified coverage or platform support.

## Definition of Done

- Acceptance criteria demonstrated;
- lint, types, and tests passing;
- empty and error states considered;
- offline flow preserved;
- accessibility verified;
- documentation consistent with delivered behavior;
- no known regression omitted.
