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
    onVerified = null,
}) {

    const api = useAPI();


    const [clientSecret, setClientSecret] =
        useState("");


    const [error, setError] =
        useState("");


    /*
     * The profile is already verified.
     *
     * Do NOT create another SetupIntent.
     */

    const isVerified =
        Boolean(
            payment?.verified
        );


    useEffect(() => {

        /*
         * Nothing to initialise when the payment
         * method has already been verified.
         */

        if (isVerified) {
            return;
        }


        loadIntent();

    }, [isVerified]);


    async function loadIntent() {

        try {

            setError("");


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
     | Already verified
     |--------------------------------------------------------------------------
     */

    if (isVerified) {

        return (
            <Elements
                stripe={stripePromise}
            >

                <PaymentDetailsStep
                    payment={payment}
                    onVerified={onVerified}
                />

            </Elements>
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
     | Stripe PaymentElement
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
                payment={payment}
                onVerified={onVerified}
            />

        </Elements>
    );

}