import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function CheckoutFlow() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Checkout Flow</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Build a cart with one-time items and recurring subscriptions, then run
        checkout against a broker that speaks{" "}
        <code className="font-mono text-sm">network.attested.*</code>. The PoS
        owns the cart records; the broker owns the payment record and issues the
        checkout URL.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          1. Create a cart
        </AnchorHeading>
        <p className="mb-3">
          Start with a cart. Provide the recipient&apos;s DID as{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            subject
          </code>{" "}
          (required) and a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            currency
          </code>
          . By default the cart is marked private, so the issued record on the
          payer&apos;s PDS omits{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            subject
          </code>{" "}
          and the line item refs &mdash; pass{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            private: false
          </code>{" "}
          to publish them.
        </p>
        <CodeBlock
          code={`const { data: created } = await paymentAgent.com.atiproto.payment.cart.create({
  subject: "did:plc:creator123",
  currency: "USD",
});

const cartUri = created.cart.uri;`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          2. Add line items
        </AnchorHeading>
        <p className="mb-3">
          Each line item is a one-time item or a recurring subscription. Pass
          the cart&apos;s URI as{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            cartUri
          </code>{" "}
          so the PoS adds the line to the existing cart. Each line item carries
          its own{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            subject
          </code>{" "}
          &mdash; either a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            com.atproto.repo.strongRef
          </code>{" "}
          to a specific record (a post, a feed) or a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            #userRef
          </code>{" "}
          wrapping a user&apos;s DID.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          One-time item targeting a user
        </AnchorHeading>
        <CodeBlock
          code={`await paymentAgent.com.atiproto.payment.item.create({
  cartUri,
  subject: {
    $type: "com.atiproto.item#userRef",
    did: "did:plc:creator123",
  },
  amount: 500,
  quantity: 1,
  message: "Great post!",
});`}
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          One-time item targeting a specific record
        </AnchorHeading>
        <CodeBlock
          code={`await paymentAgent.com.atiproto.payment.item.create({
  cartUri,
  subject: {
    $type: "com.atproto.repo.strongRef",
    uri: "at://did:plc:creator456/app.bsky.feed.post/abc123",
    cid: "bafyrei...",
  },
  amount: 1000,
});`}
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Recurring subscription
        </AnchorHeading>
        <p className="mb-3">
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            interval
          </code>{" "}
          mirrors the broker shape: pass a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            #namedInterval
          </code>{" "}
          for the common cases or a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            #customInterval
          </code>{" "}
          for an arbitrary day count.
        </p>
        <CodeBlock
          code={`await paymentAgent.com.atiproto.payment.subscription.create({
  cartUri,
  subject: {
    $type: "com.atiproto.subscription#userRef",
    did: "did:plc:creator123",
  },
  amount: 999,
  interval: {
    $type: "network.attested.payment.initiate#namedInterval",
    value: "monthly",
  },
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          3. Check out
        </AnchorHeading>
        <p className="mb-3">
          Once the cart is populated, call{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            payment.cart.checkout
          </code>{" "}
          with the cart URI and an optional{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            broker
          </code>{" "}
          (
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            did:web:...
          </code>
          ). When a broker is pre-seeded the PoS workflows through{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            network.attested.payment.initiate
          </code>{" "}
          and resolves with a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            checkoutUrl
          </code>{" "}
          and a strongRef{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            payment
          </code>
          .
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Broker pre-seeded
        </AnchorHeading>
        <CodeBlock
          code={`const { data: checkout } = await paymentAgent.com.atiproto.payment.cart.checkout({
  cart: cartUri,
  broker: "did:web:broker.example",
  redirectUrl: "https://yourapp.com/checkout/complete",
});

// payment is a com.atproto.repo.strongRef to the new network.attested.payment record
window.location.href = checkout.checkoutUrl;`}
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          No broker pre-seeded
        </AnchorHeading>
        <p className="mb-3">
          Skip the{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            broker
          </code>{" "}
          parameter and the PoS returns an{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            #initiateRequest
          </code>{" "}
          payload in{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            payment
          </code>{" "}
          (discriminated by{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            $type
          </code>
          ) so the caller can route to a broker themselves, then attach the
          resulting payment via{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            payment.cart.put
          </code>
          .
        </p>
        <CodeBlock
          code={`const { data: prep } = await paymentAgent.com.atiproto.payment.cart.checkout({
  cart: cartUri,
});

if (prep.payment.$type === "com.atiproto.payment.cart.checkout#initiateRequest") {
  // Pick a broker from the recipient's profile and call initiate yourself.
  const broker = await pickBroker(prep.payment.subject);
  const initiate = await callBrokerInitiate(broker, prep.payment);

  // Tell the PoS which payment record settles the cart.
  await paymentAgent.com.atiproto.payment.cart.put({
    uri: cartUri,
    record: {
      ...prep.cart,
      payment: { uri: initiate.payment.uri, cid: initiate.payment.cid },
    },
  });

  window.location.href = initiate.checkoutUrl;
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          4. Verify and read status
        </AnchorHeading>
        <p className="mb-3">
          The cart record carries a unified{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            status
          </code>{" "}
          field that the recipient AppView snapshots from the broker payment (
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            pending
          </code>{" "}
          /{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            completed
          </code>{" "}
          /{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            failed
          </code>{" "}
          /{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            refunded
          </code>{" "}
          /{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            cancelled
          </code>
          ). Fetch the cart to see the latest snapshot. To independently verify
          the broker payment or any signed record, call{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            network.attested.verify
          </code>
          .
        </p>
        <CodeBlock
          code={`// Hydrate the cart and its line items
const { data: hydrated } = await paymentAgent.com.atiproto.payment.cart.get({
  uri: cartUri,
});

// Independently verify the broker payment
const { data: verified } = await xrpc.call(
  "network.attested.verify",
  { uri: hydrated.cart.payment?.uri },
);`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Cart management
        </AnchorHeading>
        <ul className="list-disc pl-6 space-y-3 text-text-muted dark:text-text-muted-dark">
          <li>
            <strong className="text-text dark:text-text-dark">
              List carts
            </strong>{" "}
            &mdash;{" "}
            <a
              href="/docs/lexicon/com.atiproto.payment.cart.list"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
            >
              payment.cart.list
            </a>
            . Filters: recipient{" "}
            <code className="font-mono text-sm">subject</code>, a{" "}
            <code className="font-mono text-sm">record</code> at-uri (accepts a
            specific record or a repo-level{" "}
            <code className="font-mono text-sm">at://did:plc:...</code>),
            unified <code className="font-mono text-sm">status</code>{" "}
            (cart-lifecycle or broker-payment-snapshot values).
          </li>
          <li>
            <strong className="text-text dark:text-text-dark">
              Get cart details
            </strong>{" "}
            &mdash;{" "}
            <a
              href="/docs/lexicon/com.atiproto.payment.cart.get"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
            >
              payment.cart.get
            </a>{" "}
            returns the cart view plus a single{" "}
            <code className="font-mono text-sm">items</code> array (union of
            item and subscription views).
          </li>
          <li>
            <strong className="text-text dark:text-text-dark">
              Attach a payment
            </strong>{" "}
            &mdash;{" "}
            <a
              href="/docs/lexicon/com.atiproto.payment.cart.put"
              className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
            >
              payment.cart.put
            </a>{" "}
            takes the full cart record (including the{" "}
            <code className="font-mono text-sm">payment</code> strongRef) when
            the caller ran the broker call themselves.
          </li>
        </ul>
      </section>
    </div>
  );
}
