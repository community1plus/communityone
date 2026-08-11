export function buildIdentityWorkspace(
    state,
    actions
) {

    const {

        completion,
        sections,
        currentSection,

    } = state;


    const {

        goToSection,

    } = actions;


    const runtime =
        createWorkspaceRuntime({

            sections,

            current:
                currentSection,

        });


    return createWorkspace({

        banner:

            createWorkspaceBannerModel({

                left: {

                    title: "IDENTITY",

                },

                centre: {

                    mode: "identity",

                },

                right: {

                    metric:

                        createWorkspaceProgressModel({

                            value:
                                completion,

                        }),

                },

            }),


        navigation:

            createWorkspaceNavigationModel({

                items:
                    runtime.sections,

                current:
                    runtime.current,

                onChange:
                    goToSection,

            }),

    });

}