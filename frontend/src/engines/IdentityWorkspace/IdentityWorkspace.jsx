import CapabilityRenderer
    from "../../components/Capability/CapabilityRenderer";

import IdentityCapabilitySelector
    from "../../components/Identity/IdentityCapabilitySelector";

import {
    buildIdentityWorkspace,
} from "../../framework/Workspace/builders/buildIdentityWorkspace";

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
       WORKSPACE
    ===================================== */

const workspace =
    buildIdentityWorkspace(

        state,

        actions

    );


    const {

        banner,

        navigation,

        runtime,

    } = workspace;


    /* =====================================
       PROFILE
    ===================================== */

    const {

        values,

        form,

    } = state;


    /* =====================================
       CURRENT SECTION
    ===================================== */

const section =
    workspace?.body?.section ?? null;


    /* =====================================
       SECTION STATE
    ===================================== */

    const editing =
        Boolean(
            section?.runtime?.editing
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

    {/* =================================
       WORKSPACE HEADER
    ================================= */}

    <WorkspaceRegionHeader>

        <WorkspaceBanner
            model={banner}
        >

            <IdentityCapabilitySelector
                values={values}
                setValue={form.setValue}
                readOnly={false}
            />

        </WorkspaceBanner>

    </WorkspaceRegionHeader>


    {/* =================================
       SECTION NAVIGATION
    ================================= */}

    <WorkspaceNavigation
        model={navigation}
    />


    {/* =================================
       SECTION BODY
    ================================= */}

    <WorkspaceBody>

        {section && (

            <WorkspaceSection

                model={section}

                actions={actions}

            >

                <div className="workspace-section-content">

                    <CapabilityRenderer

                        section={section}

                        form={form}

                        editing={editing}

                    />

                </div>

            </WorkspaceSection>

        )}

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