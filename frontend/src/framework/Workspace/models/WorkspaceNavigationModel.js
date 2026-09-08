export function createWorkspaceNavigationModel({

    items = [],

    current = 0,

    onChange = () => {},

}) {

    return {

        items,

        current,

        onChange,

        visible: items.length > 1,

    };

}