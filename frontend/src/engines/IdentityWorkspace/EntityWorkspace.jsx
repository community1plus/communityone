import CapabilityRenderer
    from "../../components/Capability/CapabilityRenderer";


import {
    buildCapabilityWorkspace,
} from "../../framework/Workspace/builders/buildCapabilityWorkspace";


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


import IdentityCapabilitySelector
    from "../../components/Identity/IdentityCapabilitySelector";

export default function EntityWorkspace({

    initialCapability = "entity",

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


    /* =====================================
       GUIDE MODEL
    ===================================== */

    const guide = {

        title: "ENTITY GUIDE",

        panels: [

            {
                id: "welcome",

                title: "Welcome",

                content:
                    "Manage your trusted entity.",

            },

        ],

    };


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


    const headerAction = (

    <WorkspaceHeaderActions>

        <button
            type="button"
            className="workspace-header-action workspace-header-action-ready"
            onClick={actions.closeProfile}
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





            <WorkspaceMain>

                <WorkspaceContent>


                    {/* ==========================
                       BANNER
                    ========================== */}

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

                    </WorkspaceRegionHeader>


                    {/* ==========================
                       NAVIGATION
                    ========================== */}

                    <WorkspaceNavigation
                        model={navigation}
                    />


                    {/* ==========================
                       SECTION
                    ========================== */}

                    <WorkspaceBody>

                        {section && (

                            <WorkspaceSection
                                model={section}
                            >

                                <CapabilityRenderer

                                    section={section}

                                    form={form}

                                    editing={editing}

                                />

                            </WorkspaceSection>

                        )}

                    </WorkspaceBody>


                </WorkspaceContent>

            </WorkspaceMain>


            {/* ==============================
               GUIDE
            ============================== */}

<WorkspaceSidebar>

                <WorkspaceGuide
                    model={guide}
                />

            </WorkspaceSidebar>


        </WorkspaceShell>

    );

}