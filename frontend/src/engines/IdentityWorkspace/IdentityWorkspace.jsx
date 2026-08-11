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
       STATE
    ===================================== */

    const {

        values,

        form,

        editing,

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

const {
    section,
} = runtime ?? {};


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

                            section={section}

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

                        {banner
                            ?.right
                            ?.metric
                            ?.value ?? 0}%

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