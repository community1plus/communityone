import {createGuideModel}
from "../../../framework/Guide/models/GuideModel";

export function createIdentityGuideModel(){

    return createGuideModel({

        progress:{

            percentage:0,

            label:"Complete",

        },

        ai:{

            message:"Your assistant will appear here.",

        },

        help:{

            title:"Identity Guide",

            paragraphs:[

                "Your public name is visible to the community.",

                "Your email remains private.",

                "Verified identities receive additional trust indicators.",

            ],

        },

        next:{

            tasks:[

                "Verify your email",

            ],

        },

    });

}