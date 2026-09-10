import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import { useState } from "react";


export default function PaymentDetailsStep() {

    const stripe = useStripe();
    const elements = useElements();

    const [loading, setLoading] =
        useState(false);


    async function handleSubmit() {

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);

        const { error, setupIntent } =
            await stripe.confirmSetup({
                elements,
                confirmParams: {},
                redirect: "if_required",
            });

        setLoading(false);

        if (error) {
            alert(error.message);
            return;
        }

        console.log("Stripe SetupIntent:", setupIntent);

        alert("Card verified successfully");
    }


    return (
        <div className="space-y-6">

            <PaymentElement />

            <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !stripe || !elements}
            >
                {loading
                    ? "Verifying..."
                    : "Verify Card"}
            </button>

        </div>
    );
}