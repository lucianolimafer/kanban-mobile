# ADR-001: Expo SDK 57 with a development build

- **Status:** Accepted
- **Date:** 2026-08-28

## Context

The project uses Expo SDK 57 and WatermelonDB. WatermelonDB depends on native code that is not included in the generic Expo Go runtime.

## Decision

Develop and validate the application through local iOS and Android development builds. Documentation and CI must use versions compatible with Expo SDK 57; SDK upgrades will be deliberate rather than automatic.

## Consequences

- Initial setup requires a native toolchain and one build per platform.
- Changes to native dependencies or configuration require rebuilding the development client.
- The project can continue using Expo Router, CLI, and prebuild without claiming Expo Go compatibility.
- The minimum Node version follows the SDK 57 reference: 22.13.x.
