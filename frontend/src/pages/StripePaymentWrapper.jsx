import { useEffect, useState } from "react";

import {
  Elements,
} from "@stripe/react-stripe-js";

import {
  loadStripe,
} from "@stripe/stripe-js";

import api from "../../lib/api";

import PaymentDetailsStep
  from "./PaymentDetailsStep";

const stripePromise = loadStripe(
  import.meta.env
    .VITE_STRIPE_PUBLISHABLE_KEY
);

export default function StripePaymentWrapper() {
  const [clientSecret, setClientSecret] =
    useState("");

  useEffect(() => {
    loadIntent();
  }, []);

  async function loadIntent() {
    const res = await api.post(
      "/payments/create-setup-intent"
    );

    setClientSecret(
      res.data.clientSecret
    );
  }

  if (!clientSecret) {
    return <div>Loading...</div>;
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
    >
      <PaymentDetailsStep />
    </Elements>
  );
}