import { createWorkspaceHeaderModel } from "../models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../models/WorkspaceProgressModel";
import { createWorkspaceSectionsModel } from "../models/WorkspaceSectionsModel";

export const Workspace = {

    Header: createWorkspaceHeaderModel,

    Progress: createWorkspaceProgressModel,

    Navigation: createWorkspaceSectionsModel,

};