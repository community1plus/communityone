export function createWorkspaceSectionRuntime({

    section,

    index = 0,

}) {

    if (!section) {

        return null;

    }


    return {

        id:
            section.id,

        index,

        title:
            section.title,

        view:
            section.view,

        fields:
            section.fields || [],

        guide:
            section.guide,

        toolbar:
            section.toolbar,

        actions:
            section.actions,

        validator:
            section.validator,

        state: {

            enabled:
                section.state?.enabled ?? true,

            visible:
                section.state?.visible ?? true,

            dirty:
                false,

            valid:
                true,

            complete:
                false,

        },

    };

}