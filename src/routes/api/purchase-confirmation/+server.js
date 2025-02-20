import Stripe from 'stripe';
import { json } from '@sveltejs/kit';
import { STRIPE_API_KEY } from '$env/static/private';

const stripe = new Stripe(STRIPE_API_KEY);

export async function POST({ request }) {
  const requestBody = await request.json();
  console.log(requestBody);

  return json({ success: true });
  
  
  // const sig = request.headers.get('stripe-signature');
  // const body = await request.text();

  // let event;

  // try {
  //   event = stripe.webhooks.constructEvent(body, sig, 'your-webhook-signing-secret');
  // } catch (err) {
  //   console.error(`Webhook signature verification failed: ${err.message}`);
  //   return json({ error: 'Webhook signature verification failed' }, { status: 400 });
  // }

  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object;
  //   // Handle the checkout session completion
  //   console.log(`Payment for session ${session.id} was successful!`);
  //   // You can perform additional actions here, such as updating your database
  // }

  // return json({ received: true }, { status: 200 });
}