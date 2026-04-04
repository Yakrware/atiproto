import { CodeBlock } from "~/components/CodeBlock";

export default function StripeConnect() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Stripe Connect</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        Before a user can receive tips or subscriptions, they need to connect their Stripe account
        through atiproto.
      </p>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Check Connection Status</h2>
        <p className="mb-3">
          Use the <a href="/docs/lexicon/com.atiproto.account.profile.get" className="text-primary dark:text-primary-dark hover:underline font-mono text-sm">account.profile.get</a>{" "}
          endpoint to check whether the current user has connected their Stripe account. The{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">readyForPayment</code>{" "}
          field indicates whether their account is fully set up to receive payments.
        </p>
        <CodeBlock code={`const { data } = await tipAgent.com.atiproto.account.profile.get();

if (!data.readyForPayment) {
  // User needs to connect their Stripe account
  redirectToConnect();
}`} />
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Redirect to Connect</h2>
        <p className="mb-3">
          When a user is not connected to Stripe, send them to the atiproto connect page. This
          handles the full Stripe Connect onboarding flow including identity verification and
          bank account setup.
        </p>
        <CodeBlock code={`function redirectToConnect() {
  // Redirect to atiproto's Stripe Connect onboarding
  window.location.href = "https://atiproto.com/connect";
}`} />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          After completing the Stripe onboarding, the user is redirected back to your application.
          Their <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">readyForPayment</code>{" "}
          status will be updated automatically.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Full Integration Example</h2>
        <p className="mb-3">
          Here's a complete flow for checking a creator's payment status and prompting them to
          connect if needed:
        </p>
        <CodeBlock code={`import { Agent as TipAgent } from "@atiproto/agent";

async function ensurePaymentReady(tipAgent: TipAgent) {
  const { data } = await tipAgent.com.atiproto.account.profile.get();

  // User has no profile yet — create one with defaults
  if (!data.hasProfile) {
    await tipAgent.com.atiproto.account.profile.put({
      acceptsTips: true,
      acceptsSubscriptions: true,
    });
  }

  // Check if Stripe is connected
  if (!data.readyForPayment) {
    // Show a prompt to the user, then redirect
    window.location.href = "https://atiproto.com/connect";
    return false;
  }

  return true;
}`} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Checking Other Users</h2>
        <p className="mb-3">
          To check if another user can receive payments (e.g., before showing a tip button), use{" "}
          <a href="/docs/lexicon/com.atiproto.repo.profile.get" className="text-primary dark:text-primary-dark hover:underline font-mono text-sm">repo.profile.get</a>:
        </p>
        <CodeBlock code={`const { data } = await tipAgent.com.atiproto.repo.profile.get({
  user: "did:plc:creator123",
});

if (data.profile?.acceptsTips) {
  // Show the tip button
}`} />
      </section>
    </div>
  );
}
