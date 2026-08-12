import WorkspaceFormView
    from "../../framework/Workspace/views/WorkspaceFormView";

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


        default:

            return null;

    }

}