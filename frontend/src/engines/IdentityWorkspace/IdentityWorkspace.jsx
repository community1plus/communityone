import { useState } from "react";

import CapabilityRenderer from "../../components/Capability/CapabilityRenderer";
import CapabilityGuide from "../../components/Capability/CapabilityGuide";
import IdentityCapabilitySelector from "../../components/Identity/IdentityCapabilitySelector";

import { buildCapabilityWorkspace } from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,
    WorkspaceHeader,
    WorkspaceRegionHeader,
    WorkspaceContext,
    WorkspaceWorkflow,
    WorkspaceBody,
    WorkspaceGuide,
    WorkspaceTabs,
    WorkspaceCompletion,
    WorkspaceClose,
} from "../../framework/Workspace";

export default function IdentityWorkspace({

    initialCapability = "identity",
    state,
    actions,

}) {

    const [capability] = useState(initialCapability);

    const {

        values,
        form,

        editing,

        activeSteps,
        currentStep,
        sectionId,

    } = state;

    const workspace = buildCapabilityWorkspace({

        capability,

        state,

        actions,

    });

    return (

        <WorkspaceShell>

            <WorkspaceMain>

                <WorkspaceRegionHeader>

                    <WorkspaceHeader
                        model={workspace.header}
                    />

                </WorkspaceRegionHeader>

                <WorkspaceContext

                    mode={

                        <IdentityCapabilitySelector
                            values={values}
                            setValue={form.setValue}
                            readOnly={!editing}
                        />

                    }

                    meta={

                        <WorkspaceCompletion
                            model={workspace.progress}
                        />

                    }

                    actions={

                        <WorkspaceClose
                            onClick={workspace.header.onClose}
                        />

                    }

                />

                <WorkspaceWorkflow>

                    <WorkspaceTabs
                        model={workspace.sections}
                    />

                </WorkspaceWorkflow>

                <WorkspaceBody>

                    <CapabilityRenderer
                        capability={capability}
                        sectionId={sectionId}
                        activeSteps={activeSteps}
                        currentStep={currentStep}
                        form={form}
                        editing={editing}
                    />

                </WorkspaceBody>

            </WorkspaceMain>

<div
    style={{
        width: 340,
        minHeight: 800,
        background: "red",
    }}
>
    TEST SIDEBAR
</div>

        </WorkspaceShell>

    );

}