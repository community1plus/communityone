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

    children,

}) {


    /* =========================================
       MODEL
    ========================================= */

    const {

        left: modelLeft = {},

        centre: modelCentre = {},

        right: modelRight = {},

    } = model;


    /* =========================================
       LEFT
    ========================================= */

    const leftContent =

        left

        ??

        (

            <WorkspaceBannerSection>

                <WorkspaceTitle
                    title={
                        modelLeft.title
                    }
                />

            </WorkspaceBannerSection>

        );


    /* =========================================
       CENTER
    ========================================= */

    const centerContent =

        center

        ??

        (

            <WorkspaceBannerSection>

                <WorkspaceMode>

                    {children}

                </WorkspaceMode>

            </WorkspaceBannerSection>

        );


    /* =========================================
       RIGHT
    ========================================= */

    const rightContent =

        right

        ??

        (

            <WorkspaceBannerSection>

                <WorkspaceMetric

                    model={
                        modelRight.metric
                    }

                />

            </WorkspaceBannerSection>

        );


    /* =========================================
       RENDER
    ========================================= */

    return (

        <div className="workspace-banner">


            {/* =================================
               LEFT
            ================================= */}

            <div className="workspace-banner-left">

                {leftContent}

            </div>


            {/* =================================
               CENTER
            ================================= */}

            <div className="workspace-banner-center">

                {centerContent}

            </div>


            {/* =================================
               RIGHT
            ================================= */}

            <div className="workspace-banner-right">

                {rightContent}

            </div>


        </div>

    );

}