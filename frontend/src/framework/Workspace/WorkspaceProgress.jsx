export default function WorkspaceProgress({

    value = 0,

    label,

}) {

    return (

        <div className="workspace-progress">

            <div className="workspace-progress-header">

                <span>

                    {label}

                </span>

            </div>

            <div className="workspace-progress-track">

                <div

                    className="workspace-progress-fill"

                    style={{

                        width: `${value}%`

                    }}

                />

            </div>

        </div>

    );

}