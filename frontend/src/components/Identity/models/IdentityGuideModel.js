import { createGuideModel } from "../../../framework/Guide/models/GuideModel";

import { guideContent } from "../../../components/Guide/GuideContent";

export function createIdentityGuideModel(section) {

    const help =
        guideContent[section] ??
        guideContent.default;

    return createGuideModel({

        progress: {

            percentage: 0,

            label: "Complete",

        },

        ai: {

            message: "Your assistant will appear here.",

        },

        help,

        next: {

            tasks: [

                "Verify your email",

            ],

        },

    });

}