export const ENTITY_CLASSIFICATIONS = [
    {
        id: "BUSINESS",
        label: "Business",
    },

    {
        id: "TECHNOLOGY",
        label: "Technology",
    },

    {
        id: "FINANCE",
        label: "Finance",
    },

    {
        id: "PROPERTY",
        label: "Property & Real Estate",
    },

    {
        id: "HEALTH",
        label: "Health & Wellbeing",
    },

    {
        id: "EDUCATION",
        label: "Education",
    },

    {
        id: "ARTS_ENTERTAINMENT",
        label: "Arts & Entertainment",
    },

    {
        id: "SPORT_RECREATION",
        label: "Sport & Recreation",
    },

    {
        id: "COMMUNITY_PUBLIC",
        label: "Community & Public Affairs",
    },

    {
        id: "EVENTS_EXPERIENCES",
        label: "Events & Experiences",
    },
];


export const ENTITY_CLASSIFICATION_IDS =
    ENTITY_CLASSIFICATIONS.map(
        classification =>
            classification.id
    );


export function getEntityClassification(
    id
) {

    return ENTITY_CLASSIFICATIONS.find(
        classification =>
            classification.id === id
    ) ?? null;

}