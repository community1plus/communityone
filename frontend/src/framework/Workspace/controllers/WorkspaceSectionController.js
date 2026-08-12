export function createWorkspaceSectionController({

    sections = [],

    current = 0,

    setCurrent,

}) {

    const safeSections =
        Array.isArray(sections)
            ? sections
            : [];


    function currentSection() {

        return (
            safeSections[current]
            || null
        );

    }


function goTo(index) {

    console.log(
        "WORKSPACE NAV CLICK",
        index,
        sections[index]?.id
    );

    setCurrent(index);

}


    function next() {

        if (
            current >= safeSections.length - 1
        ) {

            return;

        }


        setCurrent(current + 1);

    }


    function previous() {

        if (current <= 0) {

            return;

        }


        setCurrent(current - 1);

    }


    function canNext() {

        return (
            current <
            safeSections.length - 1
        );

    }


    function canPrevious() {

        return current > 0;

    }


    return {

        current,

        currentSection,

        goTo,

        next,

        previous,

        canNext,

        canPrevious,

    };

}