import WorkspaceFormView
    from "../../framework/Workspace/views/WorkspaceFormView";

import SocialSection
    from "../../engines/IdentityWorkspace/sections/SocialSection";

import StripePaymentWrapper from "../../pages/StripePaymentWrapper";


export default function CapabilityRenderer({
    section,
    form,
    editing,
    sectionCompletion,
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
                    sectionCompletion={
                        sectionCompletion
                    }
                />
            );


        case "social":

            return (
                <SocialSection
                    section={section}
                    form={form}
                    editing={editing}
                    sectionCompletion={
                        sectionCompletion
                    }
                />
            );


        case "payment":

            return (
                <StripePaymentWrapper
                    payment={
                        form.getValue("payment")
                    }

                    onVerified={(payment) => {

                        form.setValue(
                            "payment",
                            payment
                        );

                    }}
                />
            );


        default:

            return null;

    }

}