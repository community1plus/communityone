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


import {
    Pencil,
    Eraser,
    RotateCcw,
    Save,
} from "lucide-react";


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


    const saving =
        Boolean(savingSection);


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


    const handleClear =
        () => {

            if (!sectionId) {
                return;
            }

            actions.clearSection(
                sectionId
            );

        };


    const handleReset =
        () => {

            if (!sectionId) {
                return;
            }

            actions.resetSection(
                sectionId
            );

        };


    const handleSave =
        async () => {

            if (!sectionId) {
                return;
            }

            await actions.handleSaveSection(
                sectionId
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

                        <div
                            className="
                                workspace-section
                            "
                        >

                            {/* ======================
                               SECTION HEADER
                            ====================== */}

                            <div
                                className="
                                    workspace-section-header
                                "
                            >

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


                                <div
                                    className="
                                        workspace-section-meta
                                    "
                                >

                                    <span
                                        className="
                                            workspace-section-completion
                                        "
                                    >
                                        {
                                            sectionCompletion
                                            ?? 0
                                        }%
                                    </span>


                                    {!editing && (

                                        <button
                                            type="button"
                                            className="
                                                workspace-section-edit
                                            "
                                            onClick={
                                                handleEdit
                                            }
                                        >

                                            <Pencil
                                                size={15}
                                                strokeWidth={1.8}
                                            />

                                            <span>
                                                Edit
                                            </span>

                                        </button>

                                    )}


                                    {editing && (

                                        <div
                                            className="
                                                workspace-section-actions
                                            "
                                        >

                                            <button
                                                type="button"
                                                className="
                                                    workspace-section-action
                                                "
                                                onClick={
                                                    handleClear
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >

                                                <Eraser
                                                    size={15}
                                                    strokeWidth={1.8}
                                                />

                                                <span>
                                                    Clear
                                                </span>

                                            </button>


                                            <button
                                                type="button"
                                                className="
                                                    workspace-section-action
                                                "
                                                onClick={
                                                    handleReset
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >

                                                <RotateCcw
                                                    size={15}
                                                    strokeWidth={1.8}
                                                />

                                                <span>
                                                    Reset
                                                </span>

                                            </button>


                                            <button
                                                type="button"
                                                className="
                                                    workspace-section-action
                                                "
                                                onClick={
                                                    handleSave
                                                }
                                                disabled={
                                                    saving
                                                }
                                            >

                                                <Save
                                                    size={15}
                                                    strokeWidth={1.8}
                                                />

                                                <span>
                                                    {
                                                        saving
                                                            ? "Saving..."
                                                            : "Save"
                                                    }
                                                </span>

                                            </button>

                                        </div>

                                    )}

                                </div>

                            </div>


                            {/* ======================
                               SECTION CONTENT
                            ====================== */}

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