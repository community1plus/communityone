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
                    current,
                    0
                ),

                safeSections.length - 1

            );


    const baseSection =
        safeSections[safeCurrent]
        || null;


    const valid =
        baseSection?.validator
            ? baseSection.validator(values)
            : true;


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


    /* =====================================
       SECTION RUNTIME
    ===================================== */

    const completion =
        sectionCompletion?.[baseSection.id]
        ?? 0;


    const editing =
        Boolean(
            editingSections?.[baseSection.id]
        );


    const runtime = {

        ...baseSection.runtime,

        visible:
            baseSection.runtime?.visible ?? true,

        enabled:
            baseSection.runtime?.enabled ?? true,

        valid,

        completion,

        editing,

        saving:
            savingSection,

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

        sectionId:
            section.id,

        valid,

    };

}