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

}) {

    /* ======================================================
       MODEL
    ====================================================== */

    const modelLeft =
        model?.left ?? {};

    const modelCentre =
        model?.centre ?? {};

    const modelRight =
        model?.right ?? {};


    /* ======================================================
       LEFT
    ====================================================== */

    const leftContent =
        left ?? (

            <WorkspaceBannerSection>

                <WorkspaceTitle
                    title={
                        modelLeft?.title ?? ""
                    }
                />

            </WorkspaceBannerSection>

        );


    /* ======================================================
       CENTER
    ====================================================== */

    const centerContent =
        center ?? (

            <WorkspaceBannerSection>

                <WorkspaceMode
                    mode={
                        modelCentre?.mode
                    }
                />

            </WorkspaceBannerSection>

        );


    /* ======================================================
       RIGHT
    ====================================================== */

    const metricModel =
        modelRight?.metric ?? null;


    const rightContent =
        right ?? (

            <WorkspaceBannerSection>

                {metricModel && (

                    <WorkspaceMetric
                        model={metricModel}
                    />

                )}

            </WorkspaceBannerSection>

        );


    /* ======================================================
       RENDER
    ====================================================== */

    return (

        <div className="workspace-banner">

            <div className="workspace-banner-left">

                {leftContent}

            </div>


            <div className="workspace-banner-center">

                {centerContent}

            </div>


            <div className="workspace-banner-right">

                {rightContent}

            </div>

        </div>

    );

}