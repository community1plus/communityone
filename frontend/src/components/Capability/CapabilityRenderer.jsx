import WorkspaceFormView
    from "../../framework/Workspace/views/WorkspaceFormView";

import SocialSection from "../sections/SocialSection";

export default function CapabilityRenderer({
    section,
    form,
    editing,
}) {

    if (!section) {
        return null;
    }

    switch (section.view) {

        case "form":

            return (
                <WorkspaceFormView
                    section={section}
                    form={form}
                    editing={editing}
                />
            );


        case "social":

            return (
                <SocialSection
                    section={section}
                    form={form}
                    editing={editing}
                />
            );


        default:

            return null;
    }
}