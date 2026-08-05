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

                <span className="workspace-completion-label">

                    {label}

                </span>

            </div>

            <div className="workspace-completion-track">

                <div

                    className="workspace-completion-fill"

                    style={{

                        width: `${value}%`,

                    }}

                />

            </div>

        </div>

    );

}