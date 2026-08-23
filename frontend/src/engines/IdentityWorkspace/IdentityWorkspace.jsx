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
    WorkspaceSectionHeader,
    WorkspaceSection,
    WorkspaceClose,

} from "../../framework/Workspace";


export default function IdentityWorkspace({

    initialCapability = "identity",

    state,

    actions,

}) {

    /* =====================================
       CAPABILITY
    ===================================== */

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

    const section =
        runtime?.section;

    const sectionId =
        section?.id;

    const editing =
        sectionId
            ? Boolean(
                editingSections?.[sectionId]
            )
            : false;

    const saving =
        Boolean(
            savingSection
        );


    /* =====================================
       SECTION ACTIONS
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


                    {/* ==========================
                       REGION HEADER
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

                        <WorkspaceSection>

                            <WorkspaceSectionHeader

                                title={
                                    section?.title ?? ""
                                }

                                completion={
                                    sectionCompletion ?? 0
                                }

                                editing={
                                    editing
                                }

                                saving={
                                    saving
                                }

                                onEdit={
                                    handleEdit
                                }

                                onClear={
                                    handleClear
                                }

                                onReset={
                                    handleReset
                                }

                                onSave={
                                    handleSave
                                }

                            />

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

                        </WorkspaceSection>

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