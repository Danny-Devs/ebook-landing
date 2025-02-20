import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import {
  STRIPE_API_KEY,
  SENDGRID_API_KEY
} from '$env/static/private';
import { Resend } from 'resend';

const stripe = new Stripe(STRIPE_API_KEY);
const resend = new Resend(SENDGRID_API_KEY);

export async function POST({ request }) {
  const sig = request.headers.get('stripe-signature');
  const body = await request.text();

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, STRIPE_API_KEY);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    // Handle the checkout session completion by sending email via SendGrid
    const msg = {
      from: "et3rnal.d@gmail.com",
      to: session.customer_details.email,
      subject: 'Purchase Confirmation',
      html: `<strong>Thank you for your purchase!</strong><br>Your session ID is ${session.id}.`
    };

    try {
      await resend.emails.send(msg);
      console.log(
        `Payment for session ${session.id} was successful! Confirmation email sent.`
      );
    } catch (error) {
      console.error(`Error sending confirmation email: ${error.message}`);
    }
  }

  return json({ received: true }, { status: 200 });
}
