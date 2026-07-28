export function createWorkspace({

    header = null,

    context = null,

    sections = null,

    progress = null,

    body = null,

    insights = null,

    actions = null,

}) {

    return {

        header,

        context,

        sections,

        progress,

        body,

        insights,

        actions,

    };

}