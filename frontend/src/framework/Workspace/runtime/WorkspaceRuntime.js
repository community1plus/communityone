export function createWorkspaceRuntime({

    sections = [],

    current = 0,

    values = {},

    sectionCompletion = {},

    editingSections = {},

    savingSection = false,

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
                    Number(current) || 0,
                    0
                ),
                safeSections.length - 1
            );


    const baseSection =
        safeSections[safeCurrent] ?? null;


    if (!baseSection) {

        return {

            sections:
                safeSections,

            current:
                safeCurrent,

            section:
                null,

            sectionId:
                null,

            valid:
                true,

        };

    }


    const valid =
        typeof baseSection.validator === "function"
            ? baseSection.validator(values)
            : true;


    const sectionId =
        baseSection.id;


    const completion =
        sectionCompletion?.[sectionId] ?? 0;


    const editing =
        Boolean(
            editingSections?.[sectionId]
        );


    const runtime = {

        ...(baseSection.runtime ?? {}),

        visible:
            baseSection.runtime?.visible ?? true,

        enabled:
            baseSection.runtime?.enabled ?? true,

        valid,

        completion,

        editing,

        saving:
            Boolean(savingSection),

    };


    const section = {

        ...baseSection,

        runtime,

    };


    return {

        sections:
            safeSections,

        current:
            safeCurrent,

        section,

        sectionId,

        valid,

    };

}