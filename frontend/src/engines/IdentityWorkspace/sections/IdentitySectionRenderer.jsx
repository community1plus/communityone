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
    sectionCompletion,
}) {

    console.log(
        "[IDENTITY SECTION RENDER]",
        {
            sectionId,
            activeSteps,
            currentStep,
            editing,
        }
    );

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

console.log(
    "[IDENTITY SECTION COMPLETION]",
    sectionId,
    sectionCompletion
);

    const sectionMap = {
        social: (
            <IdentitySocialSection
                form={form}
                editing={editing}
            />
        ),

payment: (
    <div>
        PAYMENT RENDER TEST
    </div>
),
    };

const content = (
    <div style={{ padding: "40px", fontSize: "24px" }}>
        SECTION ID: {String(sectionId)}
    </div>
);

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