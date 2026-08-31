# ADR-002: Local WatermelonDB as the source of truth

- **Status:** Accepted
- **Date:** 2026-08-28

## Context

The board must work completely without a connection and retain data after the application restarts. Memory-only state or scattered key-value storage would spread query and migration rules throughout the UI.

## Decision

Use WatermelonDB on SQLite as the MVP source of truth. The presentation layer accesses data through hooks/use cases and a repository contract; only the concrete implementation knows WatermelonDB models, queries, and writers.

## Consequences

- Observable queries update the UI after local writes.
- Every persisted mutation must run through appropriate writers or batches.
- Schema evolution requires versioned, tested migrations.
- The seed must be idempotent.
- The MVP has no backend or remote synchronization. WatermelonDB's sync adapter does not replace the need to design and operate that backend.
