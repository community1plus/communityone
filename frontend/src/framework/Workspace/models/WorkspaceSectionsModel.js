export function createWorkspaceSectionsModel({

    items = [],

    current,

    onChange,

}) {

    return {

        items,

        current,

        onChange,

        visible: items.length > 1,

    };

}