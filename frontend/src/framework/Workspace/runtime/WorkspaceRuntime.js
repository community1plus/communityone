export function createWorkspaceRuntime({

    sections = [],

    current = 0,

    values = {},

    sectionCompletion = {},

    editingSections = {},

    savingSection = false,

}) {

    /* =========================================
       NORMALISE SECTIONS
    ========================================= */

    const safeSections =
        Array.isArray(sections)
            ? sections
            : [];


    /* =========================================
       RESOLVE CURRENT INDEX
    ========================================= */

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


    /* =========================================
       HYDRATE SECTION RUNTIME
    ========================================= */

    const runtimeSections =
        safeSections.map(section => {

            const sectionId =
                section.id;


            const completion =
                Number(
                    sectionCompletion?.[sectionId]
                ) || 0;


            const editing =
                Boolean(
                    editingSections?.[sectionId]
                );


            const valid =
                section?.validator
                    ? section.validator(values)
                    : true;


            return {

                ...section,

                runtime: {

                    ...section.runtime,

                    enabled:
                        section.runtime?.enabled
                        ?? true,

                    visible:
                        section.runtime?.visible
                        ?? true,

                    dirty:
                        section.runtime?.dirty
                        ?? false,

                    valid,

                    complete:
                        completion >= 100,

                    completion,

                    editing,

                    saving:
                        savingSection,

                },

            };

        });


    /* =========================================
       CURRENT SECTION
    ========================================= */

    const section =
        runtimeSections[safeCurrent]
        ?? null;


    const sectionId =
        section?.id
        ?? null;


    const valid =
        section?.runtime?.valid
        ?? true;


    /* =========================================
       EMPTY WORKSPACE
    ========================================= */

    if (!section) {

        return {

            sections:
                runtimeSections,

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


    /* =========================================
       RUNTIME MODEL
    ========================================= */

    return {

        sections:
            runtimeSections,

        current:
            safeCurrent,

        section,

        sectionId,

        valid,

    };

}