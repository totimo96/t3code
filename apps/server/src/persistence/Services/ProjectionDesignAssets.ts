import { DesignAssetId, IsoDateTime, NonNegativeInt, ThreadId } from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { ProjectionRepositoryError } from "../Errors.ts";

export const ProjectionDesignAsset = Schema.Struct({
  assetId: DesignAssetId,
  threadId: ThreadId,
  name: Schema.String,
  mimeType: Schema.String,
  sizeBytes: NonNegativeInt,
  createdAt: IsoDateTime,
});
export type ProjectionDesignAsset = typeof ProjectionDesignAsset.Type;

export const GetProjectionDesignAssetInput = Schema.Struct({
  assetId: DesignAssetId,
});
export type GetProjectionDesignAssetInput = typeof GetProjectionDesignAssetInput.Type;

export const ListProjectionDesignAssetsInput = Schema.Struct({
  threadId: ThreadId,
});
export type ListProjectionDesignAssetsInput = typeof ListProjectionDesignAssetsInput.Type;

export interface ProjectionDesignAssetRepositoryShape {
  readonly upsert: (asset: ProjectionDesignAsset) => Effect.Effect<void, ProjectionRepositoryError>;
  readonly getById: (
    input: GetProjectionDesignAssetInput,
  ) => Effect.Effect<Option.Option<ProjectionDesignAsset>, ProjectionRepositoryError>;
  readonly listByThreadId: (
    input: ListProjectionDesignAssetsInput,
  ) => Effect.Effect<ReadonlyArray<ProjectionDesignAsset>, ProjectionRepositoryError>;
}

export class ProjectionDesignAssetRepository extends Context.Service<
  ProjectionDesignAssetRepository,
  ProjectionDesignAssetRepositoryShape
>()("t3/persistence/Services/ProjectionDesignAssets/ProjectionDesignAssetRepository") {}
