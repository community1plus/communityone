/* =========================================
   WORKSPACE SECTION ACTIONS
========================================= */

export const WORKSPACE_SECTION_ACTIONS = {

    EDIT:
        "edit",

    CLEAR:
        "clear",

    RESET:
        "reset",

    SAVE:
        "save",

};


/* =========================================
   WORKSPACE SECTION MODEL
========================================= */

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

        id,

        title,

        component,

        fields,

        view,

        guide,

        toolbar,

        actions,

        validator,

    };

}