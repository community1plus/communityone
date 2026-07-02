import "./WorkspaceShell.css";

import WorkspaceHeader from "./WorkspaceHeader";
import WorkspaceWorkflow from "./WorkspaceWorkflow";
import WorkspaceContent from "./WorkspaceContent";
import WorkspaceGuide from "./WorkspaceGuide";


export default function WorkspaceShell({

    header,

    navigation,

    content,

    guide,

}) {

    return (

        <div className="workspace-shell">

            <WorkspaceHeader>

                {header}

            </WorkspaceHeader>

            <div className="workspace-body">

                <WorkspaceWorkflow>

                    {navigation}

                </WorkspaceWorkflow>

                <WorkspaceContent>

                    {content}

                </WorkspaceContent>

                <WorkspaceGuide>

                    {guide}

                </WorkspaceGuide>

            </div>

        </div>

    );

}