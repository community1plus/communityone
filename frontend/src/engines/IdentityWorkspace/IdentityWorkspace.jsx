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
    WorkspaceSection,

} from "../../framework/Workspace";


export default function IdentityWorkspace({

    state,

    actions,

}) {


    /* =====================================
       BUILD WORKSPACE
    ===================================== */

    const workspace =
        buildIdentityWorkspace(
            state,
            actions
        );


    /* =====================================
       WORKSPACE MODEL
    ===================================== */

    const {

        banner,

        navigation,

        body,

        guide,

    } = workspace;


    /* =====================================
       PROFILE STATE
    ===================================== */

    const {

        values,

        form,

    } = state;


    /* =====================================
       CURRENT SECTION
    ===================================== */

    const section =
        body?.section
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

    const profileReady =
        (
            banner
                ?.right
                ?.metric
                ?.value
            ?? 0
        ) >= 20;


    /* =====================================
       WORKSPACE CLOSE ACTION
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

                disabled={
                    !profileReady
                }

                aria-disabled={
                    !profileReady
                }

                aria-label="Exit profile"

            >

                ×

            </button>

        </WorkspaceHeaderActions>

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

                            left={headerAction}

                            center={

                                <IdentityCapabilitySelector

                                    values={values}

                                    setValue={
                                        form.setValue
                                    }

                                    readOnly={false}

                                />

                            }

                        />

                        <WorkspaceNavigation

                            model={navigation}

                        />

                    </WorkspaceRegionHeader>


                    {/* =================================
                       WORKSPACE BODY
                    ================================= */}

                    <WorkspaceBody>

                        {section && (

                            <WorkspaceSection

                                model={section}

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
               GUIDE SIDEBAR
            ================================= */}

            <WorkspaceSidebar>

                <WorkspaceGuide

                    model={guide}

                />

            </WorkspaceSidebar>


        </WorkspaceShell>

    );

}