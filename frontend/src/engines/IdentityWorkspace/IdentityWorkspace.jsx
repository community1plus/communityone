import {
    Pencil,
    Eraser,
    RotateCcw,
    Save,
} from "lucide-react";

import "./IdentityWorkspace.css";
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

        savingProfile,

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
                editingSections?.[sectionId]
            )
            : false;


    /* =====================================
       SECTION ACTIONS
    ===================================== */

    const handleEdit =
        () => {

            if (!sectionId) {
                return;
            }


            actions.beginSectionEdit(
                sectionId
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
        () => {

            if (!sectionId) {
                return;
            }


            actions.handleSaveSection(
                sectionId
            );

        };


    /* =====================================
       DEBUG
    ===================================== */

    console.log(

        "WORKSPACE RUNTIME",

        {

            sectionId,

            section,

            editing,

        }

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


            <WorkspaceMain>

                <WorkspaceContent>


                    {/* ==========================
                       BANNER
                    ========================== */}

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner

                            model={
                                banner
                            }

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
                       CURRENT SECTION
                    ========================== */}

                    <WorkspaceBody>

                        <div className="workspace-section">


                            {/* ======================
                               SECTION HEADER
                            ====================== */}

                            <div className="workspace-section-header">


                                <div className="workspace-section-title">

                                    {
                                        section?.title
                                        ?? ""
                                    }

                                </div>


<div className="workspace-section-actions">

    {!editing ? (

        <button
            type="button"
            onClick={handleEdit}
            className="workspace-action-button"
        >

            <Pencil
                size={16}
                strokeWidth={2}
            />

            <span>Edit</span>

        </button>

    ) : (

        <>

            <button
                type="button"
                onClick={handleClear}
                className="workspace-action-button"
            >

                <Eraser
                    size={16}
                    strokeWidth={2}
                />

                <span>Clear</span>

            </button>


            <button
                type="button"
                onClick={handleReset}
                className="workspace-action-button"
            >

                <RotateCcw
                    size={16}
                    strokeWidth={2}
                />

                <span>Reset</span>

            </button>


            <button
                type="button"
                onClick={handleSave}
                disabled={savingProfile}
                className="workspace-action-button workspace-action-primary"
            >

                <Save
                    size={16}
                    strokeWidth={2}
                />

                <span>
                    {
                        savingProfile
                            ? "Saving..."
                            : "Save"
                    }
                </span>

            </button>

        </>

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

                            />


                        </div>

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