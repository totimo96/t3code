# Design Artifacts Use Orchestration Events

Design Artifact state is recorded through orchestration domain events and projected into server read models rather than implemented as a separate CRUD store. This keeps Design Threads aligned with T3 Code's existing replay, snapshot, reconnect, and failure-recovery model, while avoiding a second persistence path for thread-owned state.
