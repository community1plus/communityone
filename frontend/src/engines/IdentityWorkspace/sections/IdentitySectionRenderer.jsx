import WorkspaceSection from "../../../framework/Workspace/WorkspaceSection";
import { WorkspaceCard, WorkspaceCardBody } from "../../../framework/Workspace";

import WorkspaceForm from "../../../framework/Workspace/Form/WorkspaceForm";

import FormBuilder from "../../../components/UI/Form/FormBuilder";

import IdentitySocialSection from "../components/IdentitySocialSection";
import IdentityPaymentSection from "../components/IdentityPaymentSection";

export default function IdentitySectionRenderer({

    sectionId,
    activeSteps,
    currentStep,
    form,
    editing,

}) {

    switch (sectionId) {

        case "social":

            return (

                <WorkspaceSection>

                    <WorkspaceCard>

                        <WorkspaceCardBody>

                            <IdentitySocialSection />

                        </WorkspaceCardBody>

                    </WorkspaceCard>

                </WorkspaceSection>

            );

        case "payment":

            return (

                <WorkspaceSection>

                    <WorkspaceCard>

                        <WorkspaceCardBody>

                            <IdentityPaymentSection />

                        </WorkspaceCardBody>

                    </WorkspaceCard>

                </WorkspaceSection>

            );

        default:

            return (

                <WorkspaceSection>

                    <WorkspaceCard>

                        <WorkspaceCardBody>

                            <WorkspaceForm>

                                <FormBuilder
                                    steps={[activeSteps[currentStep]]}
                                    currentStep={0}
                                    form={form}
                                    readOnly={!editing}
                                />

                            </WorkspaceForm>

                        </WorkspaceCardBody>

                    </WorkspaceCard>

                </WorkspaceSection>

            );

    }

}