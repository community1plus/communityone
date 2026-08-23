export function createWorkspaceSectionModel({

    id,

    title,

    component = null,

    fields = [],

    view = null,

    guide = null,

    toolbar = null,

    actions = [],

    validator = null,

}) {

    return {

        /* =====================================
           DEFINITION
        ===================================== */

        id,

        title,

        component,

        fields,

        view,

        guide,

        toolbar,

        actions,

        validator,


        /* =====================================
           RUNTIME
        ===================================== */

        runtime: {

            enabled: true,

            visible: true,

            dirty: false,

            valid: true,

            complete: false,

            completion: 0,

            editing: false,

            saving: false,

        },

    };

}