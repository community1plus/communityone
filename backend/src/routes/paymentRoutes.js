import express from "express";

import { stripe } from "../lib/stripe.js";
import authMiddleware from "../../middleware/authMiddleware.js";

import {
    patchProfileService,
} from "../services/profileService.js";


const router = express.Router();


/*
|--------------------------------------------------------------------------
| Create SetupIntent
|--------------------------------------------------------------------------
|
| Creates the Stripe SetupIntent used by the PaymentElement.
| The Community One user ID is stored in Stripe metadata so that the
| subsequent verification can be bound to the authenticated user.
|
*/

router.post(
    "/create-setup-intent",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user?.userId;


            if (!userId) {

                return res.status(401).json({
                    error:
                        "Authenticated user required",
                });

            }


            const setupIntent =
                await stripe.setupIntents.create({

                    payment_method_types: [
                        "card",
                    ],

                    metadata: {
                        communityUserId: userId,
                    },

                });


            return res.status(200).json({

                clientSecret:
                    setupIntent.client_secret,

            });

        } catch (error) {

            console.error(
                "❌ CREATE SETUP INTENT ERROR:",
                error
            );

            return res.status(500).json({

                error:
                    "Failed to create setup intent",

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| Verify Payment Method
|--------------------------------------------------------------------------
|
| Receives the successful SetupIntent ID from the frontend.
|
| Stripe is queried directly from the backend to establish:
|
| 1. The SetupIntent exists.
| 2. It belongs to the authenticated Community One user.
| 3. Stripe reports the SetupIntent as succeeded.
|
| Only safe payment metadata is persisted.
|
*/

router.post(
    "/verify",
    authMiddleware,
    async (req, res) => {

        try {

            const userId =
                req.user?.userId;


            if (!userId) {

                return res.status(401).json({
                    error:
                        "Authenticated user required",
                });

            }


            const setupIntentId =
                req.body?.setupIntentId;


            if (!setupIntentId) {

                return res.status(400).json({
                    error:
                        "setupIntentId is required",
                });

            }


            /*
             * Retrieve the SetupIntent directly from Stripe.
             *
             * Expanding payment_method allows us to obtain safe
             * card metadata such as brand and last4.
             */

            const setupIntent =
                await stripe.setupIntents.retrieve(
                    setupIntentId,
                    {
                        expand: [
                            "payment_method",
                        ],
                    }
                );


            /*
             * Security boundary:
             *
             * The SetupIntent must have been created for
             * this Community One user.
             */

            const ownerId =
                setupIntent.metadata
                    ?.communityUserId;


            if (ownerId !== userId) {

                console.warn(
                    "⚠️ PAYMENT OWNERSHIP MISMATCH:",
                    {
                        setupIntentId,
                        userId,
                        ownerId,
                    }
                );

                return res.status(403).json({
                    error:
                        "Setup intent does not belong to this user",
                });

            }


            /*
             * Stripe is authoritative for verification.
             */

            if (
                setupIntent.status !==
                "succeeded"
            ) {

                return res.status(400).json({

                    error:
                        "Payment method verification was not successful",

                    status:
                        setupIntent.status,

                });

            }


            /*
             * Extract only non-sensitive card metadata.
             *
             * Never store:
             * - full card number
             * - CVC
             * - client secret
             */

            const paymentMethod =
                setupIntent.payment_method;

            const card =
                paymentMethod?.card;


            const payment = {

                verified: true,

                provider: "stripe",

                last4:
                    card?.last4 || "",

                brand:
                    card?.brand || "",

                verifiedAt:
                    new Date().toISOString(),

            };


            /*
             * Persist through the existing profile service.
             */

            const savedProfile =
                await patchProfileService({

                    userId,

                    body: {
                        profile: {
                            payment,
                        },
                    },

                    req,

                });


            return res.status(200).json({

                success: true,

                payment:
                    savedProfile?.payment ??
                    payment,

            });

        } catch (error) {

            console.error(
                "❌ VERIFY PAYMENT ERROR:",
                error
            );


            return res.status(500).json({

                error:
                    "Failed to verify payment method",

            });

        }

    }
);


export default router;