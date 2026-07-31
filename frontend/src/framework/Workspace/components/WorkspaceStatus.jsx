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

    <ProgressRing
        value={percentage}
    />

    <div className="workspace-status-text">

        <div>

            {label}

        </div>

    </div>

</div>

    );

}