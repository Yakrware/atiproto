import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function BrokerOnboarding() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Broker Onboarding</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Brokers handle the user-facing onboarding flow: collecting bank details,
        KYC, tax info, anything else needed to issue payouts. The protocol
        surface is intentionally small. A broker exposes{" "}
        <a
          href="/docs/lexicon/com.atiproto.recipient.profile.get"
          className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
        >
          recipient.profile.get
        </a>{" "}
        and returns a fresh hosted onboarding link whenever the user isn&apos;t
        fully <code className="font-mono text-sm">ready</code>. Our reference
        broker implements the back-end with Stripe Connect; the wire protocol is
        the same for any broker.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          The broker side
        </AnchorHeading>
        <p className="mb-3 text-sm">
          When a client calls{" "}
          <code className="font-mono">recipient.profile.get</code> on a broker
          (i.e. proxied through <code className="font-mono">atproto_pos</code>{" "}
          with the broker&apos;s DID as the audience), the response carries a{" "}
          <code className="font-mono">brokerView</code>:
        </p>
        <CodeBlock
          code={`{
  broker: {
    did: "did:web:broker.example",
    status: "none" | "pending" | "needs_info"
          | "ready" | "restricted" | "disabled",
    onboardingUrl?: "https://broker.example/onboard/<token>"
  }
}`}
        />
        <p className="mt-3 text-sm">
          Only <code className="font-mono">ready</code> means the user can
          receive payouts. For any other status, the broker should mint a
          short-lived hosted-onboarding URL and return it on{" "}
          <code className="font-mono">onboardingUrl</code> so the client can
          redirect.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Redirect back to the caller
        </AnchorHeading>
        <p className="mb-3 text-sm">
          The client can pass a <code className="font-mono">redirectUrl</code>{" "}
          parameter on <code className="font-mono">recipient.profile.get</code>.
          The broker embeds it in the returned{" "}
          <code className="font-mono">onboardingUrl</code> so the user lands
          back at the calling app once onboarding finishes (or is cancelled).
        </p>
        <CodeBlock
          code={`// Client-side: ask the broker for the user's status with a return URL
const { data } = await agent.xrpcClient
  .withProxy("atproto_pos", brokerDid)
  .com.atiproto.recipient.profile.get({
    redirectUrl: \`\${window.location.origin}/payments/settings\`,
  });

if (data.broker?.status !== "ready" && data.broker?.onboardingUrl) {
  window.location.href = data.broker.onboardingUrl;
}`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Brokers without a return-URL flow can ignore the parameter; the client
          should still handle the case where the user completes onboarding and
          finds their own way back.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Driving onboarding from the broker side
        </AnchorHeading>
        <p className="mb-3 text-sm">
          When a user picks your broker in an app, the typical loop is:
        </p>
        <ol className="list-decimal list-inside text-sm space-y-2 text-text-muted dark:text-text-muted-dark mb-3">
          <li>
            Client calls{" "}
            <code className="font-mono">recipient.profile.get</code> on your
            broker with <code className="font-mono">redirectUrl</code>.
          </li>
          <li>
            You return <code className="font-mono">status</code> +{" "}
            <code className="font-mono">onboardingUrl</code>. If you&apos;ve
            never seen this DID before, mint a Stripe Connect (or equivalent)
            account and start onboarding.
          </li>
          <li>
            The user finishes the hosted flow and your back end gets notified
            (e.g. Stripe webhook). Mark the user as{" "}
            <code className="font-mono">ready</code>.
          </li>
          <li>
            The user is redirected to{" "}
            <code className="font-mono">redirectUrl</code>. The calling app
            re-runs <code className="font-mono">recipient.profile.get</code> and
            sees <code className="font-mono">ready</code>.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Recommending a broker
        </AnchorHeading>
        <p className="mb-3 text-sm">
          New users start with <strong>no brokers on their DID document</strong>
          , so the loop above only runs <em>after</em> they&apos;ve picked one.
          A recipient AppView can <em>recommend</em> one or more brokers
          (showing a curated list, a single default, etc.) but should{" "}
          <strong>never</strong> add an entry directly. Only the broker itself
          should write to the user&apos;s broker list, and it does so via{" "}
          <a
            href="/docs/agent/appendBroker"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            com.appendBroker
          </a>{" "}
          at the end of its hosted onboarding flow. This keeps the broker
          accountable for the entry on the user&apos;s DID document.
        </p>
        <p className="mb-3 text-sm">
          A simple discovery check: ask the PoS for the user&apos;s brokers
          list. An empty list means no broker is configured yet, so the AppView
          shows its recommendation UI and lets the user pick.
        </p>
        <CodeBlock
          code={`const { data } = await agent.com.atiproto.recipient.profile.get();
const brokers = data.brokers ?? [];

if (brokers.length === 0) {
  // No broker yet. Show the recommendation UI. Each "recommendation"
  // is just a broker DID the AppView wants to surface to the user.
  showBrokerPicker([
    "did:web:broker.example",
    "did:web:other-broker.example",
  ]);
}

// When the user picks one, send them to the broker's hosted onboarding
// (the broker will append itself to the DID document on success).
async function pickBroker(brokerDid: string) {
  const { data } = await agent.xrpcClient
    .withProxy("atproto_pos", brokerDid)
    .com.atiproto.recipient.profile.get({
      redirectUrl: \`\${window.location.origin}/payments/settings\`,
    });
  if (data.broker?.onboardingUrl) {
    window.location.href = data.broker.onboardingUrl;
  }
}`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Once the broker has appended itself to the user&apos;s DID document,
          the standard <code className="font-mono">recipient.profile.get</code>{" "}
          loop above can drive the rest of onboarding.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Status values
        </AnchorHeading>
        <ul className="list-disc list-inside text-sm space-y-1 text-text-muted dark:text-text-muted-dark">
          <li>
            <code className="font-mono">none</code>: never seen this user; mint
            a fresh account on first sight.
          </li>
          <li>
            <code className="font-mono">pending</code>: account exists, waiting
            on verification.
          </li>
          <li>
            <code className="font-mono">needs_info</code>: blocked on additional
            info from the user. Always returns an{" "}
            <code className="font-mono">onboardingUrl</code>.
          </li>
          <li>
            <code className="font-mono">ready</code>: user can receive payouts.{" "}
            <code className="font-mono">onboardingUrl</code> optional (useful
            for editing details).
          </li>
          <li>
            <code className="font-mono">restricted</code>: payouts partially or
            temporarily disabled (e.g. KYC re-review).
          </li>
          <li>
            <code className="font-mono">disabled</code>: payouts off, account
            effectively dormant.
          </li>
        </ul>
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Values follow <code className="font-mono">knownValues</code>: brokers
          may emit additional strings for implementation-specific states, and
          consumers should treat unknown statuses as not-ready.
        </p>
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Checking other users
        </AnchorHeading>
        <p className="mb-3 text-sm">
          To check whether another user can receive payments (e.g. before
          showing a payment button), use{" "}
          <a
            href="/docs/lexicon/com.atiproto.repo.profile.get"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            repo.profile.get
          </a>
          . The profile view&apos;s{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            acceptingPayments
          </code>{" "}
          flag is server-derived from the user&apos;s DID document (the mere
          presence of a <code className="font-mono text-sm">PaymentBroker</code>{" "}
          service entry is taken as readiness in v2).
        </p>
        <CodeBlock
          code={`const { data } = await agent.com.atiproto.repo.profile.get({
  did: "did:plc:creator123",
});

if (data.profile?.acceptingPayments) {
  // Show the payment button
}`}
        />
      </section>
    </div>
  );
}
