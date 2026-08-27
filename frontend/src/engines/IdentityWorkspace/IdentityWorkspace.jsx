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
    WorkspaceHeaderActions,
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
       CURRENT SECTION
    ===================================== */

    const section =
        workspace?.body?.section
        ?? null;


    /* =====================================
       SECTION STATE
    ===================================== */

    const editing =
        Boolean(
            section?.runtime?.editing
        );


    /* =====================================
       PROFILE READINESS
    ===================================== */

    const completion =
        banner
            ?.right
            ?.metric
            ?.value
        ?? 0;


    const profileReady =
        completion >= 20;


    /* =====================================
       WORKSPACE HEADER ACTION
    ===================================== */

    const headerAction = (

        <WorkspaceHeaderActions>

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
                disabled={!profileReady}
                aria-disabled={!profileReady}
            >

                Exit

            </button>

        </WorkspaceHeaderActions>

    );


    /* =====================================
       RENDER
    ===================================== */

return (

    <WorkspaceShell>

        {/* =================================
           PRIMARY CONTENT
        ================================= */}

        <WorkspaceMain>

            <WorkspaceContent>

                <WorkspaceRegionHeader>

                    <WorkspaceBanner
                        model={banner}
                        actions={headerAction}
                    >

                        <IdentityCapabilitySelector

                            values={values}

                            setValue={form.setValue}

                            readOnly={false}

                        />

                    </WorkspaceBanner>


                    <WorkspaceNavigation
                        model={navigation}
                    />

                </WorkspaceRegionHeader>


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
           SIDEBAR
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

                    {completion}%

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