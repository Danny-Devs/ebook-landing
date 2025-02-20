import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { STRIPE_API_KEY, RESEND_API_KEY, WEBHOOK_SECRET } from '$env/static/private';
import { Resend } from 'resend';

const stripe = new Stripe(STRIPE_API_KEY);
const resend = new Resend(RESEND_API_KEY);

export async function POST({ request }) {
  // Verify we have the required headers
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let body;
  try {
    body = await request.text();
  } catch (err) {
    console.error('Error reading request body:', err);
    return json({ error: 'Failed to read request body' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    const msg = {
      from: 'Daniel Ahn <daniel@pixeldrift.co>',
      to: 'et3rnal.d@gmail.com', // Hardcoded email for testing: original - session.customer_details.email
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
      // Return error response when email fails
      return json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }
  }

  return json({ received: true }, { status: 200 });
}