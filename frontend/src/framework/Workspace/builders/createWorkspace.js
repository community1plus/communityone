export function createWorkspace({

    runtime = null,

    banner = null,

    navigation = null,

    body = null,

    guide = null,

    actions = null,

}) {

    return {

        runtime,

        banner,

        navigation,

        body,

        guide,

        actions,

    };

}