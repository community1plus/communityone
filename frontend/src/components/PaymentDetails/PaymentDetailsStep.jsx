import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import { useState } from "react";

import useAPI from "../../hooks/useAPI";


export default function PaymentDetailsStep() {

    const stripe = useStripe();
    const elements = useElements();
    const api = useAPI();

    const [loading, setLoading] =
        useState(false);


    async function handleSubmit() {

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        try {

            const {
                error,
                setupIntent,
            } = await stripe.confirmSetup({
                elements,
                confirmParams: {},
                redirect: "if_required",
            });


            if (error) {
                alert(error.message);
                return;
            }


            console.log(
                "Stripe SetupIntent:",
                setupIntent
            );


            if (
                !setupIntent?.id ||
                setupIntent.status !== "succeeded"
            ) {
                throw new Error(
                    "Stripe payment verification was not successful."
                );
            }


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


            alert(
                "Card verified successfully"
            );

        } catch (error) {

            console.error(
                "Payment verification failed:",
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