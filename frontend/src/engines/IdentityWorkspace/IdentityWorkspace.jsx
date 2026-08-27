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

    } = workspace;


    /* =====================================
       PROFILE
    ===================================== */

    const {

        values,

        form,

    } = state;


    /* =====================================
       PROFILE COMPLETION
    ===================================== */

    const profileCompletion =
        Number(
            banner
                ?.right
                ?.metric
                ?.value
            ?? 0
        );


    /* =====================================
       PROFILE READY
    ===================================== */

    const profileReady =
        profileCompletion >= 20;


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const section =
        workspace
            ?.body
            ?.section
        ?? null;


    /* =====================================
       SECTION STATE
    ===================================== */

    const editing =
        Boolean(
            section
                ?.runtime
                ?.editing
        );


    /* =====================================
       WORKSPACE EXIT
    ===================================== */

    const exitAction = (

        <button

            type="button"

            className={

                profileReady

                    ? "workspace-header-action workspace-header-action-ready"

                    : "workspace-header-action"

            }

            onClick={

                profileReady

                    ? actions.closeProfile

                    : undefined

            }

            disabled={
                !profileReady
            }

        >

            Exit

        </button>

    );


    /* =====================================
       RENDER
    ===================================== */

    return (

        <WorkspaceShell>


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

                            actions={exitAction}

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

                        {profileCompletion}%

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