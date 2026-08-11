export function createWorkspaceSectionModel({

    id,

    title,

    component = null,

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

        component,

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