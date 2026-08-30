/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   Workspace Metric
   ========================================================== */

import "./WorkspaceMetric.css";

import ProgressRing
    from "./ProgressRing";


export default function WorkspaceMetric({

    model = {},

}) {


    /* ======================================================
       VALUE
       ====================================================== */

    const value =
        typeof model?.value === "number"
            ? model.value
            : 0;


    /* ======================================================
       RENDER
       ====================================================== */

    return (

        <div className="workspace-metric">

            <ProgressRing
                value={value}
            />

        </div>

    );

}