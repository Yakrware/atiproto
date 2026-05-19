import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function StripeConnect() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Stripe Connect</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Before a user can receive payments, a broker that they list on their
        profile needs to have an account on file for them. Our reference broker
        implements this with Stripe Connect; the protocol-level flow is the same
        for any broker.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Where onboarding lives
        </AnchorHeading>
        <p className="mb-3">
          Onboarding is the <strong>broker&apos;s</strong> responsibility, not
          the PoS&apos;s. The PoS only stores the user&apos;s preferred-broker
          list on{" "}
          <a
            href="/docs/lexicon/com.atiproto.profile"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            com.atiproto.profile
          </a>
          . Each broker exposes{" "}
          <a
            href="/docs/lexicon/com.atiproto.recipient.profile.get"
            className="text-primary dark:text-primary-dark hover:underline font-mono text-sm"
          >
            recipient.profile.get
          </a>{" "}
          with an extra{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            broker
          </code>{" "}
          block on the output: the broker DID, the authed user&apos;s account
          status with that broker, and a fresh{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            onboardingUrl
          </code>{" "}
          when one is available.
        </p>
        <p className="text-sm text-text-muted dark:text-text-muted-dark">
          Status values follow{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            knownValues
          </code>
          : <code className="font-mono text-sm">none</code> /{" "}
          <code className="font-mono text-sm">pending</code> /{" "}
          <code className="font-mono text-sm">needs_info</code> /{" "}
          <code className="font-mono text-sm">ready</code> /{" "}
          <code className="font-mono text-sm">restricted</code> /{" "}
          <code className="font-mono text-sm">disabled</code>. Only{" "}
          <code className="font-mono text-sm">ready</code> means the user can
          accept payouts; anything else means the client should send the user to
          the onboarding link.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Check onboarding status
        </AnchorHeading>
        <p className="mb-3">
          Call{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            recipient.profile.get
          </code>{" "}
          against the broker (rather than the PoS). The response includes the
          standard profile view plus the broker block.
        </p>
        <CodeBlock
          code={`// Proxy through the broker's audience to reach its recipient.profile.get
const brokerDid = "did:web:broker.example";
const { data } = await xrpc
  .withProxy("atiproto_pos", brokerDid)
  .com.atiproto.recipient.profile.get();

const broker = data.broker;
if (!broker || broker.status !== "ready") {
  // Redirect the user to complete onboarding (or update an existing account)
  window.location.href = broker?.onboardingUrl ?? "/connect";
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Pick a broker from the user&apos;s profile
        </AnchorHeading>
        <p className="mb-3">
          If the user lists multiple brokers, walk the list in order. The PoS
          profile&apos;s{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            brokers
          </code>{" "}
          array is the preference order.
        </p>
        <CodeBlock
          code={`// Fetch the PoS-side profile first to find the user's brokers
const { data: posProfile } = await paymentAgent.com.atiproto.recipient.profile.get();
const brokers = posProfile.profile.brokers ?? [];

// Ask each broker about the authed user's account
async function findOnboardingTarget() {
  for (const brokerDid of brokers) {
    const { data } = await xrpc
      .withProxy("atiproto_pos", brokerDid)
      .com.atiproto.recipient.profile.get();
    if (!data.broker) continue;
    if (data.broker.status === "ready") return null; // already onboarded
    if (data.broker.onboardingUrl) return data.broker;
  }
  return null;
}

const target = await findOnboardingTarget();
if (target) window.location.href = target.onboardingUrl;`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Full integration example
        </AnchorHeading>
        <p className="mb-3">
          A complete flow: ensure the user has a profile, find a broker, and
          redirect to its onboarding URL if their account is not{" "}
          <code className="font-mono text-sm">ready</code>.
        </p>
        <CodeBlock
          code={`import { Agent as TipAgent } from "@atiproto/agent";

async function ensurePaymentReady(paymentAgent: TipAgent) {
  // 1. Pull the PoS-side profile (creates defaults if missing).
  const { data: posProfile } = await paymentAgent.com.atiproto.recipient.profile.get();

  if (!posProfile.hasProfile) {
    await paymentAgent.com.atiproto.recipient.profile.put({
      record: {
        acceptsItems: true,
        acceptsSubscriptions: true,
        createdAt: new Date().toISOString(),
      },
    });
  }

  // 2. Ask each broker about the user's onboarding state.
  const brokers = posProfile.profile.brokers ?? [];
  for (const brokerDid of brokers) {
    const { data } = await paymentAgent.xrpcClient
      .withProxy("atiproto_pos", brokerDid)
      .com.atiproto.recipient.profile.get();

    if (!data.broker) continue;
    if (data.broker.status === "ready") return true;
    if (data.broker.onboardingUrl) {
      window.location.href = data.broker.onboardingUrl;
      return false;
    }
  }

  // No broker offered an onboarding URL. The caller should surface this.
  return false;
}`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Checking other users
        </AnchorHeading>
        <p className="mb-3">
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
          flag is server-derived from the user&apos;s broker list (the mere
          presence of a broker on the list is taken as readiness in v2).
        </p>
        <CodeBlock
          code={`const { data } = await paymentAgent.com.atiproto.repo.profile.get({
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
