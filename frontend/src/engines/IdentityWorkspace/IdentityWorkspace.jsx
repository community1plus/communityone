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

    const {

        values,

        form,

        editing,

        completion,

        sections,

        currentSection,

    } = state;


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

                            section={
                                sections[currentSection]
                            }

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

                        {
                            sections[currentSection]?.title
                            ?? ""
                        }

                    </WorkspacePanel>

                </WorkspaceGuide>

            </WorkspaceSidebar>


        </WorkspaceShell>

    );

}