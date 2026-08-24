import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceSidebar,

    WorkspaceRegionHeader,
    WorkspaceHeader,

    WorkspaceWorkflow,
    WorkspaceTabs,

    WorkspaceProgress,
    WorkspaceBody,

    WorkspaceGuide,
} from "../../framework/Workspace";


import CapabilitySelector
    from "./components/CapabilitySelector";


import CapabilitySectionRenderer
    from "./sections/CapabilitySectionRenderer";


import CapabilityGuide
    from "../../components/Capability/CapabilityGuide";


export default function CapabilityWorkspace({

    state,
    actions,

}) {

    /* =====================================
       STATE
    ===================================== */

    const {

        activeSteps = [],

        currentStep = 0,

        completion = 0,

        sectionId,

    } = state;


    /* =====================================
       ACTIONS
    ===================================== */

    const {

        setCurrentStep,

    } = actions;


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const currentSection =
        activeSteps[currentStep]
        ?? null;


    /* =====================================
       RENDER
    ===================================== */

    return (

        <WorkspaceShell>


            {/* =================================
               MAIN
            ================================= */}

            <WorkspaceMain>


                {/* ==============================
                   REGION HEADER
                ============================== */}

                <WorkspaceRegionHeader>

                    <WorkspaceHeader

                        title="CAPABILITIES"

                        subtitle={
                            "Configure what this Entity can do."
                        }

                    />

                </WorkspaceRegionHeader>


                {/* ==============================
                   WORKFLOW
                ============================== */}

                <WorkspaceWorkflow>


                    <CapabilitySelector />


                    <WorkspaceTabs

                        steps={
                            activeSteps
                        }

                        currentStep={
                            currentStep
                        }

                        setCurrentStep={
                            setCurrentStep
                        }

                    />


                </WorkspaceWorkflow>


                {/* ==============================
                   OVERALL PROGRESS
                ============================== */}

                <WorkspaceProgress

                    value={
                        completion
                    }

                    label={
                        `${completion}% Complete`
                    }

                />


                {/* ==============================
                   SECTION
                ============================== */}

                <WorkspaceBody>


                    <CapabilitySectionRenderer

                        sectionId={
                            sectionId
                        }

                        section={
                            currentSection
                        }

                        state={
                            state
                        }

                        actions={
                            actions
                        }

                    />


                </WorkspaceBody>


            </WorkspaceMain>


            {/* =================================
               GUIDE
            ================================= */}

            <WorkspaceSidebar>


                <WorkspaceGuide>


                    <CapabilityGuide

                        capability="identity"

                        section={
                            sectionId
                        }

                    />


                </WorkspaceGuide>


            </WorkspaceSidebar>


        </WorkspaceShell>

    );

}