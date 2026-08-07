export default function createWorkspaceSectionController({

    sections,

    current,

    setCurrent,

}) {

    function currentSection() {

        return sections[current];

    }

    function goTo(index) {

        setCurrent(index);

    }

    return {

        currentSection,

        goTo,

    };

}