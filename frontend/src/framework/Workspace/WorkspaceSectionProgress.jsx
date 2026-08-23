import "./WorkspaceSectionProgress.css";

export default function WorkspaceSectionProgress({

    value = 0,

}) {

    const completion =
        Math.min(
            Math.max(
                Number(value) || 0,
                0
            ),
            100
        );


    return (

        <div
            className="workspace-section-progress"
            aria-label={`Section completion ${completion}%`}
        >

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