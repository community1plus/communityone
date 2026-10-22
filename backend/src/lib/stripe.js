
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const isStripeConfigured = Boolean(stripeSecretKey);

export const stripe = isStripeConfigured
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-04-30.basil",
    })
  : null;
