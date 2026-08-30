/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   Workspace Metric
   ========================================================== */

import ProgressRing
    from "./ProgressRing";

import "./WorkspaceMetric.css";


export default function WorkspaceMetric({

    model = {},

}) {

    const value =
        typeof model?.value === "number"
            ? model.value
            : 0;


    return (

        <div className="workspace-metric">

            <ProgressRing
                value={value}
            />

        </div>

    );

}