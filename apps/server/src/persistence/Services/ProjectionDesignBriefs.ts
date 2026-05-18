import { IsoDateTime, NonNegativeInt, ThreadId } from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import type { ProjectionRepositoryError } from "../Errors.ts";

export const ProjectionDesignBrief = Schema.Struct({
  threadId: ThreadId,
  markdown: Schema.String,
  version: NonNegativeInt,
  updatedAt: IsoDateTime,
});
export type ProjectionDesignBrief = typeof ProjectionDesignBrief.Type;

export const GetProjectionDesignBriefInput = Schema.Struct({
  threadId: ThreadId,
});
export type GetProjectionDesignBriefInput = typeof GetProjectionDesignBriefInput.Type;

export interface ProjectionDesignBriefRepositoryShape {
  readonly upsert: (brief: ProjectionDesignBrief) => Effect.Effect<void, ProjectionRepositoryError>;
  readonly getByThreadId: (
    input: GetProjectionDesignBriefInput,
  ) => Effect.Effect<Option.Option<ProjectionDesignBrief>, ProjectionRepositoryError>;
}

export class ProjectionDesignBriefRepository extends Context.Service<
  ProjectionDesignBriefRepository,
  ProjectionDesignBriefRepositoryShape
>()("t3/persistence/Services/ProjectionDesignBriefs/ProjectionDesignBriefRepository") {}
