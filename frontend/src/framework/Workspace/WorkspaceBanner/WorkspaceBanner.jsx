import WorkspaceBannerSection from "../WorkspaceBannerSection/WorkspaceBannerSection";
import WorkspaceTitle from ".WorkspaceTitle/WorkspaceTitle";
import WorkspaceMode from "../WorkspaceMode/WorkspaceMode";
import WorkspaceMetric from "../WorkspaceMetric/WorkspaceMetric";

import "./WorkspaceBanner.css";

export default function WorkspaceBanner({

    model,

    children,

}) {

return (

    <div className="workspace-banner">

        <WorkspaceBannerSection>

            <WorkspaceTitle
                title={model.title}
            />

        </WorkspaceBannerSection>

        {children}

        <WorkspaceBannerSection>

            <WorkspaceMetric
                model={model.metric}
            />

        </WorkspaceBannerSection>

    </div>

);

}