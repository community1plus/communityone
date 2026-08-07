import { createWorkspaceHeaderModel } from "../models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../models/WorkspaceProgressModel";
import { createWorkspaceSectionsModel } from "../models/WorkspaceNavigationModel";

export const Workspace = {

    Header: createWorkspaceHeaderModel,

    Progress: createWorkspaceProgressModel,

    Navigation: createWorkspaceSectionsModel,

};