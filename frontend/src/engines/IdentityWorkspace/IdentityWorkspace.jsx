import {
    Pencil,
    Eraser,
    RotateCcw,
    Save,
} from "lucide-react";

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
        savingSection ===
        sectionId;


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

                            <div
                                className="
                                    workspace-section-header
                                "
                            >

                                <div
                                    className="
                                        workspace-section-title
                                    "
                                >

                                    {
                                        section?.title
                                        ?? ""
                                    }

                                </div>


                                <div
                                    className="
                                        workspace-section-actions
                                    "
                                >

                                    {!editing ? (

                                        <button

                                            type="button"

                                            onClick={
                                                handleEdit
                                            }

                                            className="
                                                workspace-action
                                                workspace-action-edit
                                            "

                                        >

                                            <Pencil
                                                size={16}
                                            />

                                            <span>
                                                Edit
                                            </span>

                                        </button>

                                    ) : (

                                        <>

                                            <button

                                                type="button"

                                                onClick={
                                                    handleClear
                                                }

                                                className="
                                                    workspace-action
                                                "

                                                disabled={
                                                    saving
                                                }

                                            >

                                                <Eraser
                                                    size={16}
                                                />

                                                <span>
                                                    Clear
                                                </span>

                                            </button>


                                            <button

                                                type="button"

                                                onClick={
                                                    handleReset
                                                }

                                                className="
                                                    workspace-action
                                                "

                                                disabled={
                                                    saving
                                                }

                                            >

                                                <RotateCcw
                                                    size={16}
                                                />

                                                <span>
                                                    Reset
                                                </span>

                                            </button>


                                            <button

                                                type="button"

                                                onClick={
                                                    handleSave
                                                }

                                                className="
                                                    workspace-action
                                                    workspace-action-save
                                                "

                                                disabled={
                                                    saving
                                                }

                                            >

                                                <Save
                                                    size={16}
                                                />

                                                <span>

                                                    {
                                                        saving
                                                            ? "Saving..."
                                                            : "Save"
                                                    }

                                                </span>

                                            </button>

                                        </>

                                    )}

                                </div>

                            </div>


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