import CapabilityRenderer
    from "../../components/Capability/CapabilityRenderer";

import IdentityCapabilitySelector
    from "../../components/Identity/IdentityCapabilitySelector";

import {
    buildCapabilityWorkspace,
} from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {
    WorkspaceShell,
    WorkspaceMain,
    WorkspaceContent,
    WorkspaceSidebar,

    WorkspaceRegionHeader,
    WorkspaceBanner,
    WorkspaceNavigation,
    WorkspaceBody,

    WorkspaceGuide,
    WorkspacePanel,
    WorkspaceSection,
    WorkspaceClose,

} from "../../framework/Workspace";


export default function IdentityWorkspace({

    initialCapability = "identity",

    state,

    actions,

}) {

    /* =====================================
       CAPABILITY
    ===================================== */

    const capability =
        initialCapability;


    /* =====================================
       STATE
    ===================================== */

    const {
        values,
        form,
        editingSections,
        savingSection,
        sectionCompletion,
    } = state;


    /* =====================================
       WORKSPACE MODEL
    ===================================== */

    const {
        banner,
        navigation,
        runtime,
    } = buildCapabilityWorkspace({

        capability,
        state,
        actions,

    });


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const section =
        runtime?.section;

    const sectionId =
        section?.id;

    const editing =
        sectionId
            ? Boolean(
                editingSections?.[sectionId]
            )
            : false;

    const saving =
        Boolean(
            savingSection
        );


    /* =====================================
       RENDER
    ===================================== */

    return (

        <WorkspaceShell>

            {/* =================================
               CLOSE
            ================================= */}

            <WorkspaceClose
                onClick={
                    actions.closeProfile
                }
            />


            {/* =================================
               MAIN
            ================================= */}

            <WorkspaceMain>

                <WorkspaceContent>


                    {/* ==========================
                       REGION HEADER
                    ========================== */}

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner
                            model={banner}
                        >

                            <IdentityCapabilitySelector

                                values={
                                    values
                                }

                                setValue={
                                    form.setValue
                                }

                                readOnly={
                                    false
                                }

                            />

                        </WorkspaceBanner>

                    </WorkspaceRegionHeader>


                    {/* ==========================
                       NAVIGATION
                    ========================== */}

                    <WorkspaceNavigation
                        model={
                            navigation
                        }
                    />


                    {/* ==========================
                       SECTION
                    ========================== */}

                    <WorkspaceBody>

                        <WorkspaceSection
                            model={section}
                        >

                            <div className="workspace-section-content">

                                <CapabilityRenderer

                                    section={
                                        section
                                    }

                                    form={
                                        form
                                    }

                                    editing={
                                        editing
                                    }

                                    sectionCompletion={
                                        sectionCompletion
                                    }

                                />

                            </div>

                        </WorkspaceSection>

                    </WorkspaceBody>


                </WorkspaceContent>

            </WorkspaceMain>


            {/* =================================
               GUIDE
            ================================= */}

            <WorkspaceSidebar>

                <WorkspaceGuide
                    title="Identity Guide"
                >

                    <WorkspacePanel
                        title="Welcome"
                    >

                        Manage your trusted identity.

                    </WorkspacePanel>


                    <WorkspacePanel
                        title="Profile Completion"
                    >

                        {
                            banner
                                ?.right
                                ?.metric
                                ?.value
                            ?? 0
                        }%

                    </WorkspacePanel>


                    <WorkspacePanel
                        title="Current Section"
                    >

                        {
                            section?.title
                            ?? ""
                        }

                    </WorkspacePanel>

                </WorkspaceGuide>

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}