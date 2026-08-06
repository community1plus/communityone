export function createWorkspace({

    header = null,

    context = null,

    navigation = null,

    progress = null,

    body = null,

    insights = null,

    actions = null,

}) {

    return {

        header,

        context,

        navigation,

        progress,

        body,

        insights,

        actions,

    };

}