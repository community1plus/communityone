import "./WorkspaceCompletion.css";
export default function WorkspaceCompletion({

    model = {},

}) {

    const {

        value = 0,
        label,

    } = model;

    return (

<div className="workspace-completion">

    <div className="workspace-completion-header">

        <span className="workspace-completion-value">

            {value}%

        </span>

    </div>

<div className="workspace-metric">

    <ProgressRing
        value={model.value}
    />

</div>

</div>

    );

}