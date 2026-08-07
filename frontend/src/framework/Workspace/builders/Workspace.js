import { createWorkspaceHeaderModel } from "../models/WorkspaceHeaderModel";
import { createWorkspaceProgressModel } from "../models/WorkspaceProgressModel";
import { createWorkspaceNavigationModel } from "../models/WorkspaceNavigationModel";

export const Workspace = {

    Header: createWorkspaceHeaderModel,

    Progress: createWorkspaceProgressModel,

    Navigation: createWorkspaceNavigationModel,

};