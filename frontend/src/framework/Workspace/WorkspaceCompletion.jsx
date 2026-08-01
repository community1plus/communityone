import "./WorkspaceCompletion.css";

import ProgressRing from "./ProgressRing";

export default function WorkspaceCompletion({

    model = {},

}) {

    const {

        value = 0,
        label = "Complete",

    } = model;

    return (

        <div className="workspace-completion">

            <ProgressRing
                value={value}
            />

            <div className="workspace-completion-label">

                {label}

            </div>

        </div>

    );

}