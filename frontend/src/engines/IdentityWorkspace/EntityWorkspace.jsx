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


    const {
        values,
        form,
        editingSections,
    } = state;


    const workspace =
        buildCapabilityWorkspace({

            capability,

            state,

            actions,

        });


    const {
        banner,
        navigation,
        body,
        guide,
    } = workspace;


    /*
     * IMPORTANT:
     *
     * The builder resolves section actions
     * into renderable action objects.
     *
     * Therefore EntityWorkspace must consume
     * body.section rather than runtime.section.
     */

    const section =
        body?.section ?? null;


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


    const headerAction = (

        <WorkspaceHeaderActions>

            <button
                type="button"
                className="
                    workspace-header-action
                    workspace-header-action-ready
                "
                onClick={
                    actions.closeProfile
                }
                aria-label="Exit profile"
            >
                ×
            </button>

        </WorkspaceHeaderActions>

    );


    return (

        <WorkspaceShell>

            <WorkspaceMain>

                <WorkspaceContent>

                    <WorkspaceRegionHeader>

                        <WorkspaceBanner

                            model={
                                banner
                            }

                            left={
                                headerAction
                            }

                            center={

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

                            }

                        />


                        <WorkspaceNavigation

                            model={
                                navigation
                            }

                        />

                    </WorkspaceRegionHeader>


                    <WorkspaceBody>

                        {section && (

                            <WorkspaceSection

                                model={
                                    section
                                }

                            >

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

                            </WorkspaceSection>

                        )}

                    </WorkspaceBody>

                </WorkspaceContent>

            </WorkspaceMain>


            <WorkspaceSidebar>

                <WorkspaceGuide

                    model={
                        guide
                    }

                />

            </WorkspaceSidebar>

        </WorkspaceShell>

    );

}