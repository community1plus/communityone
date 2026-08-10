export function createWorkspaceRuntime({

    sections,

    current,

}) {

    return {

        sections,

        current,

        section:
            sections[current],

    };

}