import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function AppendBrokerPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">com.appendBroker</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-1 text-sm font-mono">
        @atiproto/agent
      </p>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Adds or promotes a <code className="font-mono">PaymentBroker</code>{" "}
        service entry on the authenticated user&apos;s DID document. Broker
        entries follow the W3C DID Core service shape and live in the
        document&apos;s <code className="font-mono">service[]</code> block. Any
        compliant PoS or broker resolves who handles payments by reading the DID
        document.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Signature
        </AnchorHeading>
        <CodeBlock
          code={`agent.com.appendBroker(
  broker: string,
  options?: AppendBrokerOptions,
): Promise<void>

interface AppendBrokerOptions {
  /** Promote ahead of the existing broker block (no effect when no brokers exist). */
  default?: boolean;
  /** Token from com.atproto.identity.requestPlcOperationSignature. */
  token?: string;
  /** Override the derived serviceEndpoint (default: https://<host> from did:web). */
  serviceEndpoint?: string;
}`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Service entry shape
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Each broker becomes one standard W3C service entry on the user&apos;s
          DID document:
        </p>
        <CodeBlock
          code={`{
  id: "${"${broker}"}#payment-broker",
  type: "PaymentBroker",
  serviceEndpoint: "https://<host>"
}`}
        />
        <p className="mt-3 text-sm">
          The <code className="font-mono">serviceEndpoint</code> is derived from
          the broker&apos;s did:web host. Pass{" "}
          <code className="font-mono">options.serviceEndpoint</code> to override
          (required when the broker is not a did:web).
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Sort rules
        </AnchorHeading>
        <ul className="list-disc list-inside text-sm space-y-2 text-text-muted dark:text-text-muted-dark">
          <li>
            <strong>No brokers yet:</strong> the new entry is appended to the
            end of <code className="font-mono">service[]</code>, regardless of
            the <code className="font-mono">default</code> flag.
          </li>
          <li>
            <strong>New broker, default=false:</strong> inserted right after the
            last existing PaymentBroker entry. The broker block stays
            contiguous.
          </li>
          <li>
            <strong>New broker, default=true:</strong> inserted just before the
            previous first PaymentBroker. Non-broker entries (e.g.{" "}
            <code className="font-mono">atproto_pds</code>) that precede the
            broker block stay where they are.
          </li>
          <li>
            <strong>Existing broker, default=false:</strong> no-op (returns
            without writing).
          </li>
          <li>
            <strong>Existing broker, default=true:</strong> moves the entry to
            the front of the broker block (no-op when it&apos;s already first).
          </li>
        </ul>
        <p className="mt-3 text-sm">
          Other services on the DID document are preserved untouched.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Add a broker
        </AnchorHeading>
        <CodeBlock
          code={`await agent.com.appendBroker("did:web:broker.example");`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Set the default broker
        </AnchorHeading>
        <CodeBlock
          code={`await agent.com.appendBroker("did:web:broker.example", {
  default: true,
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Email-confirmed PLC operations
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Many PDSes gate PLC operations on an emailed token. The common pattern
          is to try the call first (it&apos;ll fail when a token is required),
          then request the email, prompt the user, and retry:
        </p>
        <CodeBlock
          code={`async function addBroker(agent, brokerDid: string) {
  try {
    // Attempt 1: PDSes that don't require email confirmation succeed here.
    await agent.com.appendBroker(brokerDid, { default: true });
    return;
  } catch (err) {
    // Heuristic: anything that looks like "token required" triggers the
    // email flow. Match on XRPC error name / message; adjust to your PDS.
    if (!needsPlcToken(err)) throw err;
  }

  // Attempt 2: trigger the email, prompt the user, retry with the token.
  await agent.com.atproto.identity.requestPlcOperationSignature();

  const token = await promptUserForToken({
    title: "Confirm broker change",
    message: "Check your email and paste the confirmation code.",
  });

  await agent.com.appendBroker(brokerDid, { default: true, token });
}

function needsPlcToken(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { error?: string; message?: string };
  return (
    e.error === "InvalidToken" ||
    e.error === "AuthRequired" ||
    /token/i.test(e.message ?? "")
  );
}`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          The exact error code depends on the PDS implementation; tighten{" "}
          <code className="font-mono">needsPlcToken</code> against the responses
          you observe in development.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Override the serviceEndpoint
        </AnchorHeading>
        <p className="mb-3 text-sm">
          When the broker is not a did:web, or its XRPC root lives at a path
          under the host, pass{" "}
          <code className="font-mono">options.serviceEndpoint</code> explicitly.
        </p>
        <CodeBlock
          code={`await agent.com.appendBroker("did:plc:broker-abc", {
  serviceEndpoint: "https://broker.example/payment",
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Reading brokers back
        </AnchorHeading>
        <p className="mb-3 text-sm">
          Use{" "}
          <a
            href="/docs/lexicon/com.atiproto.repo.profile.get"
            className="text-primary dark:text-primary-dark hover:underline font-mono"
          >
            repo.profile.get
          </a>{" "}
          to read the current broker list. The PoS resolves the user&apos;s DID
          document for you, filters <code className="font-mono">service[]</code>{" "}
          for entries typed <code className="font-mono">PaymentBroker</code>,
          and returns the broker DIDs (the portion before{" "}
          <code className="font-mono">#payment-broker</code>) in order.
        </p>
        <CodeBlock
          code={`const { data } = await agent.com.atiproto.repo.profile.get({
  did: agent.session!.did,
});
// data.brokers === ["did:web:broker.example", ...]`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Related
        </AnchorHeading>
        <ul className="space-y-1 text-sm">
          <li>
            <a
              href="/docs/agent"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              agent
            </a>
          </li>
          <li>
            <a
              href="/docs/broker-onboarding"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              Broker Onboarding
            </a>
            : end-to-end broker onboarding flow.
          </li>
          <li>
            <a
              href="/docs/lexicon/com.atiproto.profile"
              className="text-primary dark:text-primary-dark hover:underline font-mono"
            >
              com.atiproto.profile
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
