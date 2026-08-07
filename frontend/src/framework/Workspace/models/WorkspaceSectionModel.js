export function createWorkspaceSectionModel({

    id,

    title,

    enabled = true,

    visible = true,

}) {

    return {

        id,

        title,

        enabled,

        visible,

    };

}