import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as SqlSchema from "effect/unstable/sql/SqlSchema";

import { toPersistenceSqlError } from "../Errors.ts";
import {
  GetProjectionDesignBriefInput,
  ProjectionDesignBrief,
  ProjectionDesignBriefRepository,
  type ProjectionDesignBriefRepositoryShape,
} from "../Services/ProjectionDesignBriefs.ts";

const makeProjectionDesignBriefRepository = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const upsertProjectionDesignBriefRow = SqlSchema.void({
    Request: ProjectionDesignBrief,
    execute: (row) =>
      sql`
        INSERT INTO projection_design_briefs (
          thread_id,
          markdown,
          version,
          updated_at
        )
        VALUES (
          ${row.threadId},
          ${row.markdown},
          ${row.version},
          ${row.updatedAt}
        )
        ON CONFLICT (thread_id)
        DO UPDATE SET
          markdown = excluded.markdown,
          version = excluded.version,
          updated_at = excluded.updated_at
      `,
  });

  const getProjectionDesignBriefRow = SqlSchema.findOneOption({
    Request: GetProjectionDesignBriefInput,
    Result: ProjectionDesignBrief,
    execute: ({ threadId }) =>
      sql`
        SELECT
          thread_id AS "threadId",
          markdown,
          version,
          updated_at AS "updatedAt"
        FROM projection_design_briefs
        WHERE thread_id = ${threadId}
      `,
  });

  const upsert: ProjectionDesignBriefRepositoryShape["upsert"] = (row) =>
    upsertProjectionDesignBriefRow(row).pipe(
      Effect.mapError(toPersistenceSqlError("ProjectionDesignBriefRepository.upsert:query")),
    );

  const getByThreadId: ProjectionDesignBriefRepositoryShape["getByThreadId"] = (input) =>
    getProjectionDesignBriefRow(input).pipe(
      Effect.mapError(toPersistenceSqlError("ProjectionDesignBriefRepository.getByThreadId:query")),
    );

  return {
    upsert,
    getByThreadId,
  } satisfies ProjectionDesignBriefRepositoryShape;
});

export const ProjectionDesignBriefRepositoryLive = Layer.effect(
  ProjectionDesignBriefRepository,
  makeProjectionDesignBriefRepository,
);
