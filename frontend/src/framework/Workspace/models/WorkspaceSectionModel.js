export function createWorkspaceSectionModel({

    id,

    title,

    fields = [],

    view = null,

    guide = null,

    toolbar = null,

    actions = null,

    validator = null,

}) {

    return {

        id,

        title,

        fields,

        view,

        guide,

        toolbar,

        actions,

        validator,

        runtime: {

            enabled: true,

            visible: true,

            dirty: false,

            valid: true,

            complete: false,

        },

    };

}