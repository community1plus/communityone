import { createWorkspace } from "../../../framework/Workspace/builders/createWorkspace";

import { createWorkspaceNavigationModel } from "../../../framework/Workspace/models/WorkspaceNavigationModel";

import { createWorkspaceProgressModel } from "../../../framework/Workspace/models/WorkspaceProgressModel";

import { createWorkspaceBannerModel } from "../../../framework/Workspace/models/WorkspaceBannerModel";

import { createWorkspaceRuntime } from "../../../framework/Workspace/runtime/WorkspaceRuntime";


const SECTION_ACTION_DEFINITIONS = {

    edit: {
        label: "Edit",
        icon: "✎",
    },

    clear: {
        label: "Clear",
        icon: "□",
    },

    reset: {
        label: "Reset",
        icon: "↻",
    },

    exit: {
        label: "Exit",
        icon: "×",
    },

    save: {
        label: "Save",
        icon: "✓",
        primary: true,
    },

};


export function buildEntityWorkspace(
    state,
    actions
) {

    const {
        completion,
        sections,
        currentSection,
        values,
        sectionCompletion,
        editingSections,
        savingSection,
    } = state;


    const {
        goToSection,
    } = actions;

    console.log(
    "🔥 ENTITY WORKSPACE sections:",
    sections
);

console.log(
    "🔥 ENTITY WORKSPACE currentSection:",
    currentSection
);

console.log(
    "🔥 ENTITY WORKSPACE current section id:",
    sections?.[currentSection]?.id
);

    const runtime =
        createWorkspaceRuntime({
            sections,
            current: currentSection,
            values,
            sectionCompletion,
            editingSections,
            savingSection,
        });


    const section =
        runtime.section;

    console.log(
    "🔥 ENTITY RUNTIME SECTION:",
    section
);

console.log(
    "🔥 ENTITY SECTION ACTION IDS:",
    section?.actions
);    

    const banner =
        createWorkspaceBannerModel({

            left: {
                title: "ENTITY",
            },

            center: {
                mode: "entity",
            },

            right: {
                metric:
                    createWorkspaceProgressModel({
                        value: completion,
                    }),
            },

        });


    const navigation =
        createWorkspaceNavigationModel({

            items:
                runtime.sections,

            current:
                runtime.current,

            onChange:
                goToSection,

        });


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


    if (!section) {

        return createWorkspace({

            runtime,

            banner,

            navigation,

            guide,

            body: {
                section: null,
            },

        });

    }


    const saving =
        Boolean(
            section.runtime?.saving
        );


    const sectionId =
        section.id;


    const sectionActionHandlers = {

        edit: () => {

            actions.setSectionEditing(
                sectionId,
                true
            );

        },


        clear: () => {

            actions.clearSection(
                sectionId
            );

        },


        reset: () => {

            actions.resetSection(
                sectionId
            );

        },


        exit: () => {

            actions.closeProfile();

        },


        save: async () => {

            await actions.handleSaveSection(
                sectionId
            );

        },

    };


    const isActionVisible = {

        edit: true,

        clear: true,

        reset: true,

        exit: true,

        save: true,

    };


    const sectionActions =

        (section.actions ?? [])

            .map(actionId => {

                const definition =
                    SECTION_ACTION_DEFINITIONS[
                        actionId
                    ];


                const handler =
                    sectionActionHandlers[
                        actionId
                    ];


                if (
                    !definition ||
                    !handler
                ) {

                    return null;

                }


                if (
                    !isActionVisible[
                        actionId
                    ]
                ) {

                    return null;

                }


                return {

                    id:
                        actionId,

                    label:
                        definition.label,

                    icon:
                        definition.icon,

                    primary:
                        definition.primary ??
                        false,

                    disabled:
                        actionId === "save"
                            ? saving
                            : false,

                    onClick:
                        handler,

                };

            })

            .filter(Boolean);


    const resolvedSection = {

        ...section,

        actions:
            sectionActions,

    };


    return createWorkspace({

        runtime,

        banner,

        navigation,

        guide,

        body: {

            section:
                resolvedSection,

        },

    });

}