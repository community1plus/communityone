import WorkspaceBannerSection
    from "../WorkspaceBannerSection/WorkspaceBannerSection";

import WorkspaceTitle
    from "../WorkspaceTitle";

import WorkspaceMode
    from "../WorkspaceMode";

import WorkspaceMetric
    from "../WorkspaceMetric";

import WorkspaceHeaderActions
    from "../WorkspaceHeaderActions";

import "./WorkspaceBanner.css";


export default function WorkspaceBanner({

    model,

    children,

    actions = null,

}) {

    const {

        left = {},
        centre = {},
        right = {},

    } = model;


    return (

        <div className="workspace-banner">


            {/* =================================
               LEFT
            ================================= */}

            <WorkspaceBannerSection>

                <div className="workspace-banner-title">

                    <WorkspaceTitle
                        title={left.title}
                    />


                    {actions && (

                        <WorkspaceHeaderActions>

                            {actions}

                        </WorkspaceHeaderActions>

                    )}

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