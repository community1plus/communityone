import { guideContent }
    from "../../../components/Guide/GuideContent";


export function createIdentityGuideModel(section) {

    const help =
        guideContent[section]
        ??
        guideContent.default;


    return {

        title: "IDENTITY GUIDE",

        panels: [

            {
                id: "welcome",

                title: "Welcome",

                content:
                    "Manage your trusted identity.",
            },


            {
                id: "progress",

                title: "Profile Completion",

                value: "0%",
            },


            {
                id: "help",

                title: "Help",

                content: help,
            },


            {
                id: "next",

                title: "Next",

                content: "Verify your email",
            },

        ],

    };

}