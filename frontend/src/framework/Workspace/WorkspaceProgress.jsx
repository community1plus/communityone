import "./WorkspaceProgress.css";

export default function WorkspaceProgress({

    model = {},

}) {

    const {

        value = 0,
        label,

    } = model;

    const progress = Math.max(0, Math.min(100, value));

    return (

        <section className="workspace-progress">

            <div className="workspace-progress-track">

                <div
                    className="workspace-progress-fill"
                    style={{
                        width: `${progress}%`,
                    }}
                />

            </div>

            {label && (

                <div className="workspace-progress-label">

                    {label}

                </div>

            )}

        </section>

    );

}