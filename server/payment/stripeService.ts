import Stripe from 'stripe';
import { getDb } from '../db';
import { paymentTransactions, subscriptions, invoices, agentCredits, agentCreditTransactions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { generateInvoicePDF } from './invoiceService';

// Initialize Stripe (API key from environment)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
});

export interface CreatePaymentIntentParams {
  userId: number;
  packageId: number;
  credits: number;
  amount: number; // in cents
  currency: string;
  userEmail: string;
  userName: string;
}

export interface CreateSubscriptionParams {
  userId: number;
  planType: 'basic' | 'pro' | 'business' | 'enterprise';
  monthlyCredits: number;
  monthlyPrice: number; // in cents
  currency: string;
  userEmail: string;
  userName: string;
}

/**
 * Create Stripe Payment Intent for credit purchase
 */
export async function createStripePaymentIntent(params: CreatePaymentIntentParams) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Create or retrieve Stripe customer
    const customer = await getOrCreateStripeCustomer({
      email: params.userEmail,
      name: params.userName,
      userId: params.userId,
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: params.amount,
      currency: params.currency.toLowerCase(),
      customer: customer.id,
      metadata: {
        userId: params.userId.toString(),
        packageId: params.packageId.toString(),
        credits: params.credits.toString(),
        type: 'credit_package',
      },
      description: `${params.credits.toLocaleString('de-DE')} Credits`,
    });

    // Create payment transaction record
    await db.insert(paymentTransactions).values({
      userId: params.userId,
      paymentProvider: 'stripe',
      paymentType: 'credit_package',
      amount: params.amount,
      currency: params.currency,
      creditsAdded: params.credits,
      status: 'pending',
      providerTransactionId: paymentIntent.id,
      providerCustomerId: customer.id,
      metadata: JSON.stringify({
        packageId: params.packageId,
        paymentIntentId: paymentIntent.id,
      }),
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error('[Stripe] Failed to create payment intent:', error);
    throw error;
  }
}

/**
 * Create Stripe Subscription for monthly plan
 */
export async function createStripeSubscription(params: CreateSubscriptionParams) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  try {
    // Create or retrieve Stripe customer
    const customer = await getOrCreateStripeCustomer({
      email: params.userEmail,
      name: params.userName,
      userId: params.userId,
    });

    // Create or retrieve price for this plan
    const price = await getOrCreateStripePrice({
      planType: params.planType,
      amount: params.monthlyPrice,
      currency: params.currency,
      credits: params.monthlyCredits,
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: price.id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        userId: params.userId.toString(),
        planType: params.planType,
        monthlyCredits: params.monthlyCredits.toString(),
      },
    });

    const invoice = subscription.latest_invoice as any;
    const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

    // Create subscription record
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db.insert(subscriptions).values({
      userId: params.userId,
      planType: params.planType,
      status: 'active',
      monthlyCredits: params.monthlyCredits,
      monthlyPrice: params.monthlyPrice,
      currency: params.currency,
      paymentProvider: 'stripe',
      providerSubscriptionId: subscription.id,
      providerCustomerId: customer.id,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    };
  } catch (error) {
    console.error('[Stripe] Failed to create subscription:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentSucceeded(paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(paymentIntent);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error handling event ${event.type}:`, error);
    throw error;
  }
}

/**
 * Handle successful payment intent (credit purchase)
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const db = await getDb();
  if (!db) return;

  const userId = parseInt(paymentIntent.metadata.userId);
  const credits = parseInt(paymentIntent.metadata.credits);

  // Update payment transaction
  await db
    .update(paymentTransactions)
    .set({
      status: 'completed',
      completedAt: new Date(),
    })
    .where(eq(paymentTransactions.providerTransactionId, paymentIntent.id));

  // Add credits to user
  await addCreditsToUser(userId, credits, paymentIntent.id);

  // Generate invoice
  const transaction = await db
    .select()
    .from(paymentTransactions)
    .where(eq(paymentTransactions.providerTransactionId, paymentIntent.id))
    .limit(1);

  if (transaction.length > 0) {
    await generateInvoiceForTransaction(transaction[0]);
  }

  console.log(`[Stripe] Payment succeeded: ${credits} credits added to user ${userId}`);
}

/**
 * Handle failed payment intent
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(paymentTransactions)
    .set({ status: 'failed' })
    .where(eq(paymentTransactions.providerTransactionId, paymentIntent.id));

  console.log(`[Stripe] Payment failed: ${paymentIntent.id}`);
}

/**
 * Handle paid invoice (subscription)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  const inv = invoice as any;
  if (!inv.subscription) return;

  const subscriptionId = inv.subscription as string;
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

  const userId = parseInt(stripeSubscription.metadata.userId);
  const monthlyCredits = parseInt(stripeSubscription.metadata.monthlyCredits);

  // Add monthly credits to user
  await addCreditsToUser(userId, monthlyCredits, invoice.id);

  // Update subscription period
    const sub = stripeSubscription as any;
    await db
    .update(subscriptions)
    .set({
      currentPeriodStart: new Date(sub.current_period_start * 1000),
      currentPeriodEnd: new Date(sub.current_period_end * 1000),
    })
    .where(eq(subscriptions.providerSubscriptionId, subscriptionId));

  console.log(`[Stripe] Invoice paid: ${monthlyCredits} credits added to user ${userId}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const db = await getDb();
  if (!db) return;

  const inv = invoice as any;
  if (!inv.subscription) return;

  const subscriptionId = inv.subscription as string;

  // Pause subscription (user can reactivate after updating payment method)
  await db
    .update(subscriptions)
    .set({ status: 'paused' })
    .where(eq(subscriptions.providerSubscriptionId, subscriptionId));

  console.log(`[Stripe] Invoice payment failed for subscription: ${subscriptionId}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
    })
    .where(eq(subscriptions.providerSubscriptionId, subscription.id));

  console.log(`[Stripe] Subscription canceled: ${subscription.id}`);
}

/**
 * Add credits to user account
 */
async function addCreditsToUser(userId: number, credits: number, transactionRef: string) {
  const db = await getDb();
  if (!db) return;

  // Get current balance
  const currentBalance = await db
    .select()
    .from(agentCredits)
    .where(eq(agentCredits.userId, userId))
    .limit(1);

  if (currentBalance.length === 0) {
    // Create new balance
    await db.insert(agentCredits).values({
      userId,
      balance: credits,
    });
  } else {
    // Update balance
    await db
      .update(agentCredits)
      .set({
        balance: currentBalance[0].balance + credits,
      })
      .where(eq(agentCredits.userId, userId));
  }

  // Record transaction
  await db.insert(agentCreditTransactions).values({
    userId,
    amount: credits,
    transactionType: 'purchase',
    description: `Purchased ${credits.toLocaleString('de-DE')} credits (${transactionRef})`,
  });
}

/**
 * Generate invoice for completed transaction
 */
async function generateInvoiceForTransaction(transaction: typeof paymentTransactions.$inferSelect) {
  const db = await getDb();
  if (!db) return;

  // Get user details
  const { users: usersTable } = await import('../../drizzle/schema');
  const userResult = await db.select().from(usersTable).where(eq(usersTable.id, transaction.userId)).limit(1);

  if (userResult.length === 0) return;
  const user = userResult[0];

  // Calculate tax
  const taxRate = 19; // 19% VAT for Germany
  const netAmount = transaction.amount;
  const taxAmount = Math.round(netAmount * (taxRate / 100));
  const totalAmount = netAmount + taxAmount;

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();

  // Create invoice record
  const invoiceData = {
    userId: transaction.userId,
    invoiceNumber,
    paymentTransactionId: transaction.id,
    amount: netAmount,
    currency: transaction.currency,
    taxRate,
    taxAmount,
    totalAmount,
    billingName: user.name || user.username,
    billingEmail: user.email,
    itemDescription: `${transaction.creditsAdded?.toLocaleString('de-DE')} Credits`,
    status: 'paid' as const,
    issuedAt: new Date(),
    paidAt: transaction.completedAt || new Date(),
  };

  const [invoice] = await db.insert(invoices).values(invoiceData).$returningId();

  // Generate PDF
  const pdfUrl = await generateInvoicePDF({
    ...invoiceData,
    id: invoice.id,
  });

  // Update invoice with PDF URL
  await db
    .update(invoices)
    .set({ pdfUrl })
    .where(eq(invoices.id, invoice.id));

  console.log(`[Stripe] Invoice generated: ${invoiceNumber}`);
}

/**
 * Generate unique invoice number
 */
async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Get last invoice number for this year
  const lastInvoice = await db
    .select()
    .from(invoices)
    .where(eq(invoices.invoiceNumber, `INV-${year}-%`))
    .orderBy(invoices.id)
    .limit(1);

  let sequence = 1;
  if (lastInvoice.length > 0) {
    const lastNumber = lastInvoice[0].invoiceNumber.split('-')[2];
    sequence = parseInt(lastNumber) + 1;
  }

  return `INV-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Get or create Stripe customer
 */
async function getOrCreateStripeCustomer(params: {
  email: string;
  name: string;
  userId: number;
}): Promise<Stripe.Customer> {
  // Search for existing customer by email
  const existingCustomers = await stripe.customers.list({
    email: params.email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: {
      userId: params.userId.toString(),
    },
  });
}

/**
 * Get or create Stripe price for subscription plan
 */
async function getOrCreateStripePrice(params: {
  planType: string;
  amount: number;
  currency: string;
  credits: number;
}): Promise<Stripe.Price> {
  // Search for existing price
  const existingPrices = await stripe.prices.list({
    lookup_keys: [`${params.planType}_monthly`],
    limit: 1,
  });

  if (existingPrices.data.length > 0) {
    return existingPrices.data[0];
  }

  // Create product
  const product = await stripe.products.create({
    name: `Mi42 ${params.planType.charAt(0).toUpperCase() + params.planType.slice(1)} Plan`,
    description: `${params.credits.toLocaleString('de-DE')} Credits pro Monat`,
    metadata: {
      planType: params.planType,
      monthlyCredits: params.credits.toString(),
    },
  });

  // Create price
  return await stripe.prices.create({
    product: product.id,
    unit_amount: params.amount,
    currency: params.currency.toLowerCase(),
    recurring: {
      interval: 'month',
    },
    lookup_key: `${params.planType}_monthly`,
  });
}

/**
 * Cancel subscription
 */
export async function cancelStripeSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    console.log(`[Stripe] Subscription canceled: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Failed to cancel subscription:', error);
    throw error;
  }
}
