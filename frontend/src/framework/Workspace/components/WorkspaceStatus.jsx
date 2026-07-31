import "./WorkspaceStatus.css";

export default function WorkspaceStatus({

    model = {},

}) {

    const {

        percentage = 0,
        label = "",

    } = model;

    return (

        <div className="workspace-status">

            <div className="workspace-status-circle">

                {percentage}%

            </div>

            <div className="workspace-status-label">

                {label}

            </div>

        </div>

    );

}