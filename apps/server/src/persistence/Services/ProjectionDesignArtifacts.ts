import { IsoDateTime, NonNegativeInt, ThreadId } from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { ProjectionRepositoryError } from "../Errors.ts";

export const ProjectionDesignArtifact = Schema.Struct({
  threadId: ThreadId,
  html: Schema.String,
  version: NonNegativeInt,
  updatedAt: IsoDateTime,
});
export type ProjectionDesignArtifact = typeof ProjectionDesignArtifact.Type;

export const GetProjectionDesignArtifactInput = Schema.Struct({
  threadId: ThreadId,
});
export type GetProjectionDesignArtifactInput = typeof GetProjectionDesignArtifactInput.Type;

export interface ProjectionDesignArtifactRepositoryShape {
  readonly upsert: (
    artifact: ProjectionDesignArtifact,
  ) => Effect.Effect<void, ProjectionRepositoryError>;
  readonly getByThreadId: (
    input: GetProjectionDesignArtifactInput,
  ) => Effect.Effect<Option.Option<ProjectionDesignArtifact>, ProjectionRepositoryError>;
}

export class ProjectionDesignArtifactRepository extends Context.Service<
  ProjectionDesignArtifactRepository,
  ProjectionDesignArtifactRepositoryShape
>()("t3/persistence/Services/ProjectionDesignArtifacts/ProjectionDesignArtifactRepository") {}
