import WorkspaceBannerSection from "../WorkspaceBannerSection/WorkspaceBannerSection";
import WorkspaceTitle from "../WorkspaceTitle";
import WorkspaceMode from "../WorkspaceMode";
import WorkspaceMetric from "../WorkspaceMetric";

import "./WorkspaceBanner.css";

export default function WorkspaceBanner({

    model,

    children,

}) {

return (

    <div className="workspace-banner">

<WorkspaceBannerSection>

    <WorkspaceTitle

        title={model.left.title}

    />

</WorkspaceBannerSection>

<WorkspaceBannerSection>

    <WorkspaceMode>

        {children}

    </WorkspaceMode>

</WorkspaceBannerSection>

<WorkspaceBannerSection>

    <WorkspaceMetric

        model={model.right.metric}

    />

</WorkspaceBannerSection>

    </div>

);

}