import { useEffect, useState } from "react";

import {
    Elements,
} from "@stripe/react-stripe-js";

import {
    loadStripe,
} from "@stripe/stripe-js";

import useAPI from "../hooks/useAPI";

import PaymentDetailsStep
    from "../components/PaymentDetails/PaymentDetailsStep";


const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);


export default function StripePaymentWrapper({

    payment = null,

    editing = false,

    onVerified = null,

}) {

    const api = useAPI();


    const [clientSecret, setClientSecret] =
        useState("");


    const [error, setError] =
        useState("");


    /*
     * A verified payment is locked during normal
     * workspace viewing.
     *
     * When editing begins, a new SetupIntent is required
     * so the user can replace the payment method.
     */

    const isVerified =
        Boolean(
            payment?.verified
        );


    const showVerified =
        isVerified &&
        !editing;


    useEffect(() => {

        /*
         * Existing verified payment and normal view.
         *
         * No Stripe initialisation required.
         */

        if (showVerified) {

            setClientSecret("");

            setError("");

            return;

        }


        /*
         * We are either:

         * 1. verifying an initial payment method, or
         * 2. replacing an existing payment method.
         */

        loadIntent();


    }, [
        showVerified,
        editing,
    ]);


    async function loadIntent() {

        try {

            setError("");

            setClientSecret("");


            const res =
                await api.post(
                    "/payments/create-setup-intent"
                );


            if (!res?.clientSecret) {

                throw new Error(
                    "Stripe did not return a client secret."
                );

            }


            setClientSecret(
                res.clientSecret
            );


        } catch (error) {

            console.error(
                "❌ CREATE SETUP INTENT ERROR:",
                error
            );


            setError(
                error?.message ||
                "Unable to initialise payment verification."
            );

        }

    }


    /*
     |--------------------------------------------------------------------------
     | Existing verified payment
     |--------------------------------------------------------------------------
     */

    if (showVerified) {

        return (
            <div className="payment-verification-success">

                <div className="payment-verification-header">

                    <strong>
                        Payment method verified
                    </strong>

                </div>


                <div className="payment-verification-details">

                    {payment?.brand && (
                        <span>
                            {payment.brand}
                        </span>
                    )}


                    {payment?.last4 && (
                        <span>
                            •••• {payment.last4}
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
     | Stripe initialisation error
     |--------------------------------------------------------------------------
     */

    if (error) {

        return (
            <div className="payment-error">

                {error}

            </div>
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Waiting for SetupIntent
     |--------------------------------------------------------------------------
     */

    if (!clientSecret) {

        return (
            <div>
                Loading...
            </div>
        );

    }


    /*
     |--------------------------------------------------------------------------
     | Payment replacement / initial verification
     |--------------------------------------------------------------------------
     */

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
            }}
        >

            <PaymentDetailsStep

                payment={
                    payment
                }

                editing={
                    editing
                }

                onVerified={
                    onVerified
                }

            />

        </Elements>
    );

}