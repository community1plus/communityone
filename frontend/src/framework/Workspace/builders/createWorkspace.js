export function createWorkspace({

    runtime = null,

    banner = null,

    navigation = null,

    body = null,

    guide = null,

    actions = null,

}) {

return createWorkspace({

    runtime,

    banner:

        createWorkspaceBannerModel({

            left: {

                title:
                    "IDENTITY",

            },

            centre: {

                mode:
                    "identity",

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