import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

import {
    useEffect,
    useState,
} from "react";

import useAPI
    from "../../hooks/useAPI";


export default function PaymentDetailsStep({

    payment = null,

    editing = false,

    onVerified = null,

}) {

    const stripe = useStripe();

    const elements = useElements();

    const api = useAPI();


    /*
     * Local verification state.
     */

    const [
        verifiedPayment,
        setVerifiedPayment,
    ] = useState(
        payment?.verified
            ? payment
            : null
    );


    const [
        loading,
        setLoading,
    ] = useState(false);


    /*
     * Rehydrate local state when the saved profile
     * payment state changes.
     */

    useEffect(() => {

        if (payment?.verified) {

            setVerifiedPayment(
                payment
            );

        }

    }, [
        payment,
    ]);


    /*
     * A verified payment is displayed only when the
     * workspace is NOT in edit mode.
     *
     * Edit means replace the existing payment method.
     */

    const isVerified =
        Boolean(
            verifiedPayment?.verified
        );


    const showVerified =
        isVerified &&
        !editing;


    async function handleSubmit() {

        /*
         * Never submit while already verified unless
         * the workspace explicitly entered edit mode.
         */

        if (
            isVerified &&
            !editing
        ) {
            return;
        }


        if (
            !stripe ||
            !elements
        ) {
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
                        message:
                            error.message,
                        param:
                            error.param,
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
             * Build local verified state.
             */

            const savedPayment =
                verification?.payment || {

                    verified: true,

                    provider: "stripe",

                };


            /*
             * Immediately lock this newly verified
             * payment method.
             */

            setVerifiedPayment(
                savedPayment
            );


            /*
             * Refresh the parent profile state.
             */

            if (
                typeof onVerified ===
                "function"
            ) {

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

    if (showVerified) {

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
     | Stripe PaymentElement
     |--------------------------------------------------------------------------
     */

    return (
        <div className="space-y-6">

            <PaymentElement />


            <button
                type="button"
                onClick={
                    handleSubmit
                }
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