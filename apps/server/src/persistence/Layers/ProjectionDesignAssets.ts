import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as SqlSchema from "effect/unstable/sql/SqlSchema";

import { toPersistenceSqlError } from "../Errors.ts";
import {
  GetProjectionDesignAssetInput,
  ListProjectionDesignAssetsInput,
  ProjectionDesignAsset,
  ProjectionDesignAssetRepository,
  type ProjectionDesignAssetRepositoryShape,
} from "../Services/ProjectionDesignAssets.ts";

const makeProjectionDesignAssetRepository = Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  const upsertRow = SqlSchema.void({
    Request: ProjectionDesignAsset,
    execute: (row) =>
      sql`
        INSERT INTO projection_design_assets (
          asset_id,
          thread_id,
          name,
          mime_type,
          size_bytes,
          created_at
        )
        VALUES (
          ${row.assetId},
          ${row.threadId},
          ${row.name},
          ${row.mimeType},
          ${row.sizeBytes},
          ${row.createdAt}
        )
        ON CONFLICT (asset_id)
        DO UPDATE SET
          thread_id = excluded.thread_id,
          name = excluded.name,
          mime_type = excluded.mime_type,
          size_bytes = excluded.size_bytes,
          created_at = excluded.created_at
      `,
  });

  const getByIdRow = SqlSchema.findOneOption({
    Request: GetProjectionDesignAssetInput,
    Result: ProjectionDesignAsset,
    execute: ({ assetId }) =>
      sql`
        SELECT
          asset_id AS "assetId",
          thread_id AS "threadId",
          name,
          mime_type AS "mimeType",
          size_bytes AS "sizeBytes",
          created_at AS "createdAt"
        FROM projection_design_assets
        WHERE asset_id = ${assetId}
        LIMIT 1
      `,
  });

  const listByThreadIdRows = SqlSchema.findAll({
    Request: ListProjectionDesignAssetsInput,
    Result: ProjectionDesignAsset,
    execute: ({ threadId }) =>
      sql`
        SELECT
          asset_id AS "assetId",
          thread_id AS "threadId",
          name,
          mime_type AS "mimeType",
          size_bytes AS "sizeBytes",
          created_at AS "createdAt"
        FROM projection_design_assets
        WHERE thread_id = ${threadId}
        ORDER BY created_at ASC, asset_id ASC
      `,
  });

  const upsert: ProjectionDesignAssetRepositoryShape["upsert"] = (row) =>
    upsertRow(row).pipe(
      Effect.mapError(toPersistenceSqlError("ProjectionDesignAssetRepository.upsert:query")),
    );

  const getById: ProjectionDesignAssetRepositoryShape["getById"] = (input) =>
    getByIdRow(input).pipe(
      Effect.mapError(toPersistenceSqlError("ProjectionDesignAssetRepository.getById:query")),
    );

  const listByThreadId: ProjectionDesignAssetRepositoryShape["listByThreadId"] = (input) =>
    listByThreadIdRows(input).pipe(
      Effect.mapError(
        toPersistenceSqlError("ProjectionDesignAssetRepository.listByThreadId:query"),
      ),
    );

  return {
    upsert,
    getById,
    listByThreadId,
  } satisfies ProjectionDesignAssetRepositoryShape;
});

export const ProjectionDesignAssetRepositoryLive = Layer.effect(
  ProjectionDesignAssetRepository,
  makeProjectionDesignAssetRepository,
);
