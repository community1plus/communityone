import "./WorkspaceCompletion.css";

import WorkspaceMetric
    from "./WorkspaceMetric";


export default function WorkspaceCompletion({

    model = {},

}) {

    return (

        <div className="workspace-completion">

            <WorkspaceMetric
                model={model}
            />

        </div>

    );

}