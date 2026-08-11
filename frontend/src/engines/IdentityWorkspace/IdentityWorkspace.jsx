import CapabilityRenderer
    from "../../components/Capability/CapabilityRenderer";

import IdentityCapabilitySelector
    from "../../components/Identity/IdentityCapabilitySelector";

import {
    buildCapabilityWorkspace,
} from "../../framework/Workspace/builders/buildCapabilityWorkspace";

import {createWorkspaceRuntime}
    from "../../framework/Workspace/runtime/WorkspaceRuntime";

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

    WorkspaceClose,

} from "../../framework/Workspace";


export default function IdentityWorkspace({

    initialCapability = "identity",

    state,

    actions,

}) {

    const capability =
        initialCapability;


    /* =====================================
       WORKSPACE STATE
    ===================================== */

const runtime =
    createWorkspaceRuntime({

        sections,

        current:
            currentSection,

    });

const {

    sectionRuntime,

} = runtime;    


    /* =====================================
       RUNTIME
    ===================================== */

    const {

        section,

    } = runtime;


    /* =====================================
       WORKSPACE MODEL
    ===================================== */

    const {

        banner,

        navigation,

    } = buildCapabilityWorkspace({

        capability,

        state,

        actions,

    });


    /* =====================================
       RENDER
    ===================================== */

    return (

        <WorkspaceShell>


            {/* ==============================
               CLOSE
            ============================== */}

            <WorkspaceClose

                onClick={
                    actions.closeProfile
                }

            />


            <WorkspaceMain>


                <WorkspaceContent>


                    {/* ==========================
                       BANNER
                    ========================== */}

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner

                            model={banner}

                        >

                            <IdentityCapabilitySelector

                                values={values}

                                setValue={
                                    form.setValue
                                }

                                readOnly={
                                    !editing
                                }

                            />

                        </WorkspaceBanner>

                    </WorkspaceRegionHeader>


                    {/* ==========================
                       NAVIGATION
                    ========================== */}

                    <WorkspaceNavigation

                        model={navigation}

                    />


                    {/* ==========================
                       CURRENT SECTION
                    ========================== */}

                    <WorkspaceBody>

<CapabilityRenderer

    section={sectionRuntime}

    form={form}

    editing={editing}

/>

                    </WorkspaceBody>


                </WorkspaceContent>


            </WorkspaceMain>


            {/* ==============================
               GUIDE
            ============================== */}

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

                        {completion ?? 0}%

                    </WorkspacePanel>


                    <WorkspacePanel

                        title="Current Section"

                    >

                        {section?.title ?? ""}

                    </WorkspacePanel>


                </WorkspaceGuide>

            </WorkspaceSidebar>


        </WorkspaceShell>

    );

}