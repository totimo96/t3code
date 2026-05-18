import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as SqlSchema from "effect/unstable/sql/SqlSchema";

import { toPersistenceSqlError } from "../Errors.ts";
import {
  GetProjectionDesignArtifactInput,
  ProjectionDesignArtifact,
  ProjectionDesignArtifactRepository,
  type ProjectionDesignArtifactRepositoryShape,
} from "../Services/ProjectionDesignArtifacts.ts";

const makeProjectionDesignArtifactRepository = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const upsertProjectionDesignArtifactRow = SqlSchema.void({
    Request: ProjectionDesignArtifact,
    execute: (row) =>
      sql`
        INSERT INTO projection_design_artifacts (
          thread_id,
          html,
          version,
          updated_at
        )
        VALUES (
          ${row.threadId},
          ${row.html},
          ${row.version},
          ${row.updatedAt}
        )
        ON CONFLICT (thread_id)
        DO UPDATE SET
          html = excluded.html,
          version = excluded.version,
          updated_at = excluded.updated_at
      `,
  });

  const getProjectionDesignArtifactRow = SqlSchema.findOneOption({
    Request: GetProjectionDesignArtifactInput,
    Result: ProjectionDesignArtifact,
    execute: ({ threadId }) =>
      sql`
        SELECT
          thread_id AS "threadId",
          html,
          version,
          updated_at AS "updatedAt"
        FROM projection_design_artifacts
        WHERE thread_id = ${threadId}
      `,
  });

  const upsert: ProjectionDesignArtifactRepositoryShape["upsert"] = (row) =>
    upsertProjectionDesignArtifactRow(row).pipe(
      Effect.mapError(toPersistenceSqlError("ProjectionDesignArtifactRepository.upsert:query")),
    );

  const getByThreadId: ProjectionDesignArtifactRepositoryShape["getByThreadId"] = (input) =>
    getProjectionDesignArtifactRow(input).pipe(
      Effect.mapError(
        toPersistenceSqlError("ProjectionDesignArtifactRepository.getByThreadId:query"),
      ),
    );

  return {
    upsert,
    getByThreadId,
  } satisfies ProjectionDesignArtifactRepositoryShape;
});

export const ProjectionDesignArtifactRepositoryLive = Layer.effect(
  ProjectionDesignArtifactRepository,
  makeProjectionDesignArtifactRepository,
);
