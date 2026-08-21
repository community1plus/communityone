import "./WorkspaceMetric.css";

import ProgressRing
    from "./ProgressRing";


export default function WorkspaceMetric({

    model = {},

}) {

    const value =
        model?.value ?? 0;

    return (

        <div className="workspace-metric">

            <ProgressRing
                value={value}
                size={64}
                stroke={4}
            />

        </div>

    );

}