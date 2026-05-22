import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function PaymentDetailsStep() {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    loadIntent();
  }, []);

  async function loadIntent() {
    const res = await api.post(
      "/payments/create-setup-intent"
    );

    setClientSecret(res.data.clientSecret);
  }

  async function handleSubmit() {
    if (!stripe || !elements) return;

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

    console.log(setupIntent);

    alert("Card verified successfully");
  }

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <PaymentElement />

      <button
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading
          ? "Verifying..."
          : "Verify Card"}
      </button>
    </div>
  );
}