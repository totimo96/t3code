import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as Effect from "effect/Effect";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  yield* sql`
    ALTER TABLE projection_threads
    ADD COLUMN workspace_kind TEXT NOT NULL DEFAULT 'coding'
  `;

  yield* sql`
    UPDATE projection_threads
    SET workspace_kind = 'coding'
    WHERE workspace_kind IS NULL
      OR workspace_kind NOT IN ('coding', 'design')
  `;
});
