import { CodeBlock } from "~/components/CodeBlock";

export default function CheckoutFlow() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Checkout Flow</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Learn how to create carts, add tips and subscriptions, and redirect users to checkout.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Cart-Based Checkout</h2>
        <p className="mb-3">
          The standard flow lets you build a cart with multiple tips and subscriptions before sending
          the user to checkout.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">1. Create a Cart</h3>
        <p className="mb-3">
          Start by creating an empty cart. Specify the currency and an optional redirect URL for
          after checkout completes.
        </p>
        <CodeBlock code={`const { data: cartData } = await tipAgent.com.atiproto.account.cart.create({
  currency: "USD",
  redirectUrl: "https://yourapp.com/checkout/complete",
});

const cartUri = cartData.cartUri;
const checkoutUrl = cartData.checkoutUrl;`} />

        <h3 className="text-lg font-medium mt-6 mb-3">2. Add Tips to the Cart</h3>
        <p className="mb-3">
          Add one or more tips by passing the <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">cartUri</code>.
          Each tip is added to the existing cart.
        </p>
        <CodeBlock code={`// Tip a user $5.00
await tipAgent.com.atiproto.feed.tip.create({
  subject: "did:plc:creator123",
  amount: 500,
  currency: "USD",
  cartUri: cartUri,
  message: "Great post!",
});

// Tip another user on a specific record
await tipAgent.com.atiproto.feed.tip.create({
  subject: "did:plc:creator456",
  amount: 1000,
  currency: "USD",
  cartUri: cartUri,
  recordUri: "at://did:plc:creator456/app.bsky.feed.post/abc123",
});`} />

        <h3 className="text-lg font-medium mt-6 mb-3">3. Redirect to Checkout</h3>
        <p className="mb-3">
          Once the cart is ready, redirect the user to the <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">checkoutUrl</code>.
          This takes them to atiproto's hosted checkout page where they complete payment via Stripe.
        </p>
        <CodeBlock code={`// Redirect the user to complete payment
window.location.href = checkoutUrl;`} />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          After payment, the user is redirected back to your <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">redirectUrl</code>.
          Tip statuses update from <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">pending</code> to{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">completed</code> once payment settles.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Quick Checkout</h2>
        <p className="mb-3">
          For a faster flow, skip cart creation entirely. When you create a tip or subscription
          without a <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">cartUri</code>,
          a new cart is automatically created and the <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">checkoutUrl</code>{" "}
          is returned in the response.
        </p>

        <h3 className="text-lg font-medium mt-6 mb-3">Quick Tip</h3>
        <CodeBlock code={`// Create a tip — automatically creates a cart and returns checkoutUrl
const { data } = await tipAgent.com.atiproto.feed.tip.create({
  subject: "did:plc:creator123",
  amount: 500,
  currency: "USD",
  redirectUrl: "https://yourapp.com/thanks",
});

// Send the user straight to checkout
window.location.href = data.checkoutUrl;`} />

        <h3 className="text-lg font-medium mt-6 mb-3">Quick Subscription</h3>
        <CodeBlock code={`// Create a subscription — goes straight to checkout
const { data } = await tipAgent.com.atiproto.feed.subscription.create({
  subject: "did:plc:creator123",
  amount: 999,
  currency: "USD",
  interval: "monthly",
});

// Redirect to Stripe-powered subscription checkout
window.location.href = data.checkoutUrl;`} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Cart Management</h2>
        <p className="mb-3">Additional cart operations:</p>
        <ul className="list-disc pl-6 space-y-3 text-text-muted dark:text-text-muted-dark">
          <li>
            <strong className="text-text dark:text-text-dark">List carts</strong> —{" "}
            <a href="/docs/lexicon/com.atiproto.account.cart.list" className="text-primary dark:text-primary-dark hover:underline font-mono text-sm">
              account.cart.list
            </a>{" "}
            to view all carts, filterable by status
          </li>
          <li>
            <strong className="text-text dark:text-text-dark">Get cart details</strong> —{" "}
            <a href="/docs/lexicon/com.atiproto.account.cart.get" className="text-primary dark:text-primary-dark hover:underline font-mono text-sm">
              account.cart.get
            </a>{" "}
            to fetch a cart with resolved tips and subscriptions
          </li>
          <li>
            <strong className="text-text dark:text-text-dark">Clone a cart</strong> —{" "}
            <a href="/docs/lexicon/com.atiproto.account.cart.clone" className="text-primary dark:text-primary-dark hover:underline font-mono text-sm">
              account.cart.clone
            </a>{" "}
            to duplicate an existing cart (useful for re-tipping)
          </li>
        </ul>
      </section>
    </div>
  );
}
