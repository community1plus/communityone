/* ==========================================================
   COMMUNITY ONE PLATFORM FRAMEWORK (CPF)

   Workspace Banner
   ========================================================== */

import WorkspaceBannerSection
    from "../WorkspaceBannerSection/WorkspaceBannerSection";

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

    children = null,

}) {


    /* ======================================================
       MODEL
       ====================================================== */

    const {

        left: modelLeft = {},

        center: modelCenter = {},

        centre: modelCentre = {},

        right: modelRight = {},

    } = model;


    /*
     * Support both `center` and the older `centre`
     * while the framework is being refactored.
     */

    const modeModel =
        Object.keys(modelCenter).length
            ? modelCenter
            : modelCentre;


    /* ======================================================
       LEFT
       ====================================================== */

    const leftContent =

        left !== null

            ? left

            : (

                <WorkspaceBannerSection>

                    <WorkspaceTitle
                        title={
                            modelLeft.title
                        }
                    />

                </WorkspaceBannerSection>

            );


    /* ======================================================
       CENTER
       ====================================================== */

    const centerContent =

        center !== null

            ? center

            : (

                <WorkspaceBannerSection>

                    <WorkspaceMode
                        model={modeModel}
                    >

                        {children}

                    </WorkspaceMode>

                </WorkspaceBannerSection>

            );


    /* ======================================================
       RIGHT
       ====================================================== */

    const rightContent =

        right !== null

            ? right

            : (

                <WorkspaceBannerSection>

                    <WorkspaceMetric
                        model={
                            modelRight.metric
                        }
                    />

                </WorkspaceBannerSection>

            );


    /* ======================================================
       RENDER
       ====================================================== */

    return (

        <div className="workspace-banner">


            {/* ==================================================
               LEFT
               ================================================== */}

            <div className="workspace-banner-left">

                {leftContent}

            </div>


            {/* ==================================================
               CENTER
               ================================================== */}

            <div className="workspace-banner-center">

                {centerContent}

            </div>


            {/* ==================================================
               RIGHT
               ================================================== */}

            <div className="workspace-banner-right">

                {rightContent}

            </div>


        </div>

    );

}