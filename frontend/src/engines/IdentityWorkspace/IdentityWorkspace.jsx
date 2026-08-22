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
        editingSections,
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

    const {
        section,
    } = runtime ?? {};


    const sectionId =
        section?.id;


    const editing =
        sectionId
            ? Boolean(
                editingSections?.[
                    sectionId
                ]
            )
            : false;


    /* =====================================
       ACTIONS
    ===================================== */

    const handleEdit =
        () => {

            if (!sectionId) {
                return;
            }


            actions.setSectionEditing(
                sectionId,
                true
            );

        };


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

                        <div className="workspace-section">


                            {/* ======================
                               SECTION HEADER
                            ====================== */}

                            <div className="workspace-section-header">


                                {/* ==================
                                   SECTION TITLE
                                ================== */}

                                <div className="workspace-section-title">

                                    {
                                        section?.title
                                        ?? ""
                                    }

                                </div>


                                {/* ==================
                                   SECTION META
                                ================== */}

                                <div className="workspace-section-meta">

                                    <span className="workspace-section-completion">

                                        {
                                            sectionCompletion
                                            ?? 0
                                        }%

                                    </span>


                                    <button
                                        type="button"
                                        className="workspace-section-edit"
                                        onClick={
                                            handleEdit
                                        }
                                    >

                                        Edit

                                    </button>

                                </div>


                            </div>


                            {/* ======================
                               SECTION CONTENT
                            ====================== */}

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


                        </div>

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