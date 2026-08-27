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

    model,

    children,

    actions,

}) {

    const {

        left = {},
        right = {},

    } = model;


    return (

        <div className="workspace-banner">


            {/* =================================
               LEFT
            ================================= */}

            <WorkspaceBannerSection>

                <div className="workspace-banner-left">

                    <WorkspaceTitle
                        title={left.title}
                    />

                    {actions}

                </div>

            </WorkspaceBannerSection>


            {/* =================================
               CENTRE
            ================================= */}

            <WorkspaceBannerSection>

                <WorkspaceMode>

                    {children}

                </WorkspaceMode>

            </WorkspaceBannerSection>


            {/* =================================
               RIGHT
            ================================= */}

            <WorkspaceBannerSection>

                <WorkspaceMetric
                    model={right.metric}
                />

            </WorkspaceBannerSection>


        </div>

    );

}