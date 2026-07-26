import WorkspaceSection from "../../../framework/Workspace/WorkspaceSection";
import {
    WorkspaceCard,
    WorkspaceCardBody
} from "../../../framework/Workspace";

import WorkspaceForm from "../../../framework/Workspace/Form/WorkspaceForm";

import FormBuilder from "../../../components/UI/Form/FormBuilder";

import { IdentitySections } from "./IdentitySections";
import IdentitySocialSection from "../../../components/Identity/IdentitySocialSection";
import IdentityPaymentSection from "../../../components/Identity/IdentityPaymentSection";

export default function IdentitySectionRenderer({
    sectionId,
    activeSteps,
    currentStep,
    form,
    editing,
}) {

    const defaultContent = (
        <WorkspaceForm>
            <FormBuilder
                steps={[activeSteps[currentStep]]}
                currentStep={0}
                form={form}
                readOnly={!editing}
            />
        </WorkspaceForm>
    );

    const sectionMap = {
        social: (
            <IdentitySocialSection
                form={form}
                editing={editing}
            />
        ),

        payment: (
            <IdentityPaymentSection
                form={form}
                editing={editing}
            />
        ),
    };

const content =
    identitySections({ form, editing })[sectionId] ??
    defaultContent;

    return (
        <WorkspaceSection>
            <WorkspaceCard>
                <WorkspaceCardBody>
                    {content}
                </WorkspaceCardBody>
            </WorkspaceCard>
        </WorkspaceSection>
    );
}