import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import {
  STRIPE_API_KEY,
  RESEND_API_KEY,
  WEBHOOK_SECRET
} from '$env/static/private';
import { Resend } from 'resend';

const stripe = new Stripe(STRIPE_API_KEY);
const resend = new Resend(RESEND_API_KEY);

const PDF_GUIDE_URL =
  'https://narrify-public.s3.eu-central-1.amazonaws.com/sample.pdf';

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
    console.log('session object', session);

    // Extract and log the customer's email
    const customerEmail = session.customer_details?.email;
    if (!customerEmail) {
      console.error('Customer email not found in session object');
      return json({ error: 'Customer email not found' }, { status: 400 });
    }
    console.log('Customer email:', customerEmail);

    const msg = {
      from: 'Daniel Ahn <daniel@pixeldrift.co>',
      to: 'et3rnal.d@gmail.com', // Use the customer email from the session object
      subject: 'Purchase Confirmation',
      text: `<strong>Thank you for your purchase!</strong><br>Your session ID is ${session.id}.`,
      attachments: [
        {
          path: PDF_GUIDE_URL,
          filename: 'Digital Ebook - Spain Relocation.pdf'
        }
      ]
    };

    try {
      await resend.emails.send(msg);
      console.log(
        `Payment for session ${session.id} was successful! Confirmation email sent to ${customerEmail}.`
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
