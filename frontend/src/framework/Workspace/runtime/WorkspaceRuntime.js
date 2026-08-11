export function createWorkspaceRuntime({

    sections = [],

    current = 0,

}) {

    const safeSections =
        Array.isArray(sections)
            ? sections
            : [];


    const safeCurrent =
        safeSections.length === 0

            ? 0

            : Math.min(

                Math.max(
                    current,
                    0
                ),

                safeSections.length - 1

            );


    const section =
        safeSections[safeCurrent]
        || null;


    return {

        sections:
            safeSections,

        current:
            safeCurrent,

        section,

        sectionId:
            section?.id ?? null,

    };

}