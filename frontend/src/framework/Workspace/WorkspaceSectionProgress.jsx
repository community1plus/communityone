import "./WorkspaceSectionProgress.css";


export default function WorkspaceSectionProgress({

    value = 0,

}) {

    const completion =
        Math.min(
            100,
            Math.max(
                0,
                Number(value) || 0
            )
        );


    return (

        <div className="workspace-section-progress">

            <div className="workspace-section-progress-track">

                <div
                    className="workspace-section-progress-fill"
                    style={{
                        width: `${completion}%`,
                    }}
                />

            </div>


            <span className="workspace-section-progress-value">

                {completion}%

            </span>

        </div>

    );

}