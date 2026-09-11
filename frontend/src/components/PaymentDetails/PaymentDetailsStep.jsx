import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import { useEffect, useState } from "react";

import useAPI from "../../hooks/useAPI";


export default function PaymentDetailsStep({
    payment = null,
    onVerified = null,
}) {

    const stripe = useStripe();
    const elements = useElements();
    const api = useAPI();


    /*
     * Local verification state.
     *
     * This immediately locks the UI after a successful
     * verification without waiting for the profile to
     * rehydrate.
     */

    const [verifiedPayment, setVerifiedPayment] =
        useState(
            payment?.verified
                ? payment
                : null
        );


    const [loading, setLoading] =
        useState(false);


    /*
     * Rehydrate local state when the saved profile
     * payment state changes.
     */

    useEffect(() => {

        if (payment?.verified) {

            setVerifiedPayment(payment);

        }

    }, [payment]);


    /*
     * Payment has already been verified.
     *
     * Do not render PaymentElement again.
     * Do not allow another confirmSetup().
     */

    const isVerified =
        Boolean(
            verifiedPayment?.verified
        );


    async function handleSubmit() {

        /*
         * Defensive guard.
         *
         * Even if the button somehow gets triggered while
         * the component is already verified, never attempt
         * to confirm the SetupIntent again.
         */

        if (isVerified) {
            return;
        }


        if (!stripe || !elements) {
            return;
        }


        setLoading(true);


        try {

            const {
                error,
                setupIntent,
            } =
                await stripe.confirmSetup({

                    elements,

                    confirmParams: {},

                    redirect: "if_required",

                });


            /*
             * Stripe rejected the confirmation.
             */

            if (error) {

                console.error(
                    "❌ STRIPE CONFIRM ERROR:",
                    {
                        type: error.type,
                        code: error.code,
                        decline_code:
                            error.decline_code,
                        message: error.message,
                        param: error.param,
                    }
                );

                throw new Error(
                    error.message ||
                    "Unable to verify card"
                );

            }


            console.log(
                "Stripe SetupIntent:",
                setupIntent
            );


            /*
             * Stripe must explicitly report success.
             */

            if (
                !setupIntent?.id ||
                setupIntent.status !== "succeeded"
            ) {

                throw new Error(
                    "Stripe payment verification was not successful."
                );

            }


            /*
             * Ask Community One's backend to verify
             * and persist the payment method.
             */

            const verification =
                await api.post(
                    "/payments/verify",
                    {
                        setupIntentId:
                            setupIntent.id,
                    }
                );


            console.log(
                "Community One payment verification:",
                verification
            );


            /*
             * Build the local verified state from the
             * backend response.
             */

            const savedPayment =
                verification?.payment || {

                    verified: true,

                    provider: "stripe",

                };


            /*
             * Lock the component immediately.
             *
             * This prevents another confirmSetup() call
             * against the already-succeeded SetupIntent.
             */

            setVerifiedPayment(
                savedPayment
            );


            /*
             * Allow the parent/wrapper to refresh the
             * broader profile state if required.
             */

            if (typeof onVerified === "function") {

                onVerified(
                    savedPayment
                );

            }


        } catch (error) {

            console.error(
                "❌ Payment verification failed:",
                error
            );

            alert(
                error?.message ||
                "Unable to verify card"
            );

        } finally {

            setLoading(false);

        }

    }


    /*
     |--------------------------------------------------------------------------
     | Verified state
     |--------------------------------------------------------------------------
     */

    if (isVerified) {

        return (
            <div className="payment-verification-success">

                <div className="payment-verification-header">

                    <strong>
                        Payment method verified
                    </strong>

                </div>


                <div className="payment-verification-details">

                    {verifiedPayment?.brand && (
                        <span>
                            {verifiedPayment.brand}
                        </span>
                    )}


                    {verifiedPayment?.last4 && (
                        <span>
                            •••• {verifiedPayment.last4}
                        </span>
                    )}

                </div>


                <div className="payment-verification-status">

                    ✓ Verified

                </div>

            </div>
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Verification state
     |--------------------------------------------------------------------------
     */

    return (
        <div className="space-y-6">

            <PaymentElement />


            <button
                type="button"
                onClick={handleSubmit}
                disabled={
                    loading ||
                    !stripe ||
                    !elements
                }
            >

                {loading
                    ? "Verifying..."
                    : "Verify Card"}

            </button>

        </div>
    );

}