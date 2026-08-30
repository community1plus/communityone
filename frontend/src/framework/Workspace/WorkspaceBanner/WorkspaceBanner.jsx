/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   WORKSPACE BANNER
   ========================================================== */

import WorkspaceTitle
    from "../WorkspaceTitle";

import WorkspaceMode
    from "../WorkspaceMode";

import WorkspaceMetric
    from "../WorkspaceMetric";

import "./WorkspaceBanner.css";


export default function WorkspaceBanner({

    model = {},

    left = null,

    center = null,

    right = null,

}) {

    const {

        left: modelLeft = {},

        centre: modelCentre = {},

        right: modelRight = {},

    } = model;


    /* ======================================================
       LEFT
       ====================================================== */

    const leftContent = (

        <>

            {left}

            {modelLeft.title && (

                <WorkspaceTitle
                    title={modelLeft.title}
                />

            )}

        </>

    );


    /* ======================================================
       CENTER
       ====================================================== */

    const centerContent =

        center ?? (

            <WorkspaceMode>

                {modelCentre.mode}

            </WorkspaceMode>

        );


    /* ======================================================
       RIGHT
       ====================================================== */

    const rightContent =

        right ?? (

            <WorkspaceMetric
                model={modelRight.metric}
            />

        );


    /* ======================================================
       RENDER
       ====================================================== */

    return (

        <div className="workspace-banner">


            {/* =============================================
               LEFT
            ============================================= */}

            <div className="workspace-banner-left">

                {leftContent}

            </div>


            {/* =============================================
               CENTER
            ============================================= */}

            <div className="workspace-banner-center">

                {centerContent}

            </div>


            {/* =============================================
               RIGHT
            ============================================= */}

            <div className="workspace-banner-right">

                {rightContent}

            </div>


        </div>

    );

}