import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function PermissionSets() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">OAuth Scopes</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        OAuth scope strings for accessing a
        <span className="text-primary dark:text-primary-dark">TIP</span>roto
        resources. The recommended approach is to request explicit{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          repo:
        </code>{" "}
        and{" "}
        <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
          rpc:
        </code>{" "}
        scopes per record collection and XRPC method.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Overview
        </AnchorHeading>
        <p className="mb-3">
          An OAuth scope string is a space-separated list of scope tokens. For
          atiproto access, build it from three pieces:
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              atproto
            </code>{" "}
            &mdash; required base scope for any ATProto OAuth client
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              repo:&lt;collection&gt;
            </code>{" "}
            &mdash; one per record collection your app writes to (e.g.{" "}
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              repo:com.atiproto.cart
            </code>
            )
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              rpc:&lt;nsid&gt;?aud=&lt;aud&gt;
            </code>{" "}
            &mdash; one per XRPC method your app calls. Use{" "}
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              aud=*
            </code>{" "}
            for atiproto methods (the proxy provides the audience), or the
            literal service DID (URL-encoded) for non-atiproto namespaces like{" "}
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              chat.bsky
            </code>
          </li>
        </ul>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          atiproto also publishes two bundled permission sets (
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            authGeneral
          </code>{" "}
          and{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            authEnhanced
          </code>
          ), referenced via{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            include:
          </code>{" "}
          scope strings. They're documented below for completeness, but{" "}
          <strong>not currently recommended</strong> &mdash; use the explicit
          scope form instead.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Chat Pre-Authorization (Receipts)
        </AnchorHeading>
        <p className="mb-4">
          a<span className="text-primary dark:text-primary-dark">TIP</span>roto
          delivers payment receipts to users via Bluesky DM. The package exports
          a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            prepChatForReceipts
          </code>{" "}
          helper that pre-authorizes a chat conversation with the atiproto bot
          account so receipts deliver to the user's inbox instead of landing in
          the Requests folder, which most users miss. Call it once on login (or
          whenever you have a freshly authenticated session).
        </p>
        <p className="mb-4">
          For this to work, your OAuth scope string must grant RPC access to the
          four{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            chat.bsky.convo.*
          </code>{" "}
          methods the helper calls, with the audience set to the Bluesky chat
          service. Without these scopes, the call fails — callers typically want
          to fire-and-forget and swallow the rejection.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Required scopes
        </AnchorHeading>
        <p className="mb-3">
          Add these four RPC scopes to your OAuth scope string. The audience DID
          is URL-encoded (
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            %23
          </code>{" "}
          for{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            #
          </code>
          ):
        </p>
        <CodeBlock
          language="text"
          code={`rpc:chat.bsky.convo.getConvoAvailability?aud=did:web:api.bsky.chat%23bsky_chat
rpc:chat.bsky.convo.getConvoForMembers?aud=did:web:api.bsky.chat%23bsky_chat
rpc:chat.bsky.convo.acceptConvo?aud=did:web:api.bsky.chat%23bsky_chat
rpc:chat.bsky.convo.sendMessage?aud=did:web:api.bsky.chat%23bsky_chat`}
        />
        <p className="mt-3 mb-3">Each maps to one call the helper makes:</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              getConvoAvailability
            </code>{" "}
            &mdash; skip if already accepted or chat disabled
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              getConvoForMembers
            </code>{" "}
            &mdash; resolve / create the convo
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              acceptConvo
            </code>{" "}
            &mdash; flip from <em>request</em> to <em>accepted</em>
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              sendMessage
            </code>{" "}
            &mdash; post a confirmation message so the convo is bidirectionally
            accepted (otherwise later bot DMs may still land in Requests)
          </li>
        </ul>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Usage
        </AnchorHeading>
        <p className="mb-3">
          Call{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            prepChatForReceipts
          </code>{" "}
          on the user's authenticated{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            @atproto/api
          </code>{" "}
          Agent &mdash; typically once per session, right after OAuth completes.
          Fire-and-forget; failures (no scope, network blip, chat disabled)
          shouldn't block the login flow:
        </p>
        <CodeBlock
          code={`import { Agent as BskyAgent } from "@atproto/api";
import {
  prepChatForReceipts,
  ATIPROTO_BSKY_DID,
} from "@atiproto/agent";

const bskyAgent = new BskyAgent(oauthSession);

void prepChatForReceipts(bskyAgent, [ATIPROTO_BSKY_DID]).catch(() => {
  // best-effort — swallow
});`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Per-Call Scope Mapping
        </AnchorHeading>
        <p className="mb-3">
          Every XRPC call requires its own{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            rpc:
          </code>{" "}
          scope. Procedures that write to the user's PDS via the workflow
          interpreter additionally require{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            repo:
          </code>{" "}
          scopes for the collections they touch.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Example: creating a payment
        </AnchorHeading>
        <p className="mb-3">
          Calling{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            com.atiproto.payment.item.create
          </code>{" "}
          drives the agent through a workflow that creates a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            com.atiproto.item
          </code>{" "}
          record, then a{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            com.atiproto.cart
          </code>{" "}
          record. The minimum scopes are:
        </p>
        <CodeBlock
          language="text"
          code={`atproto
repo:com.atiproto.item
repo:com.atiproto.cart
rpc:com.atiproto.payment.item.create?aud=*`}
        />
        <p className="mt-3 text-sm text-text-muted dark:text-text-muted-dark">
          Use{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            aud=*
          </code>{" "}
          for atiproto RPC methods &mdash; the proxy header sets the actual
          audience at request time, so a wildcard scope is sufficient and works
          across environments.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          OAuth Client Example
        </AnchorHeading>
        <p className="mb-3">
          A typical client building scopes from collections-it-writes and
          methods-it-calls:
        </p>
        <CodeBlock
          code={`const REPO_COLLECTIONS = [
  "com.atiproto.cart",
  "com.atiproto.item",
  "com.atiproto.subscription",
];

const RPC_METHODS = [
  "com.atiproto.payment.cart.create",
  "com.atiproto.payment.cart.get",
  "com.atiproto.payment.item.create",
  "com.atiproto.payment.subscription.create",
  // ...add the methods your app calls
];

const CHAT_METHODS = [
  "chat.bsky.convo.getConvoAvailability",
  "chat.bsky.convo.getConvoForMembers",
  "chat.bsky.convo.acceptConvo",
];
const CHAT_AUD = "did:web:api.bsky.chat%23bsky_chat";

const scope = [
  "atproto",
  ...REPO_COLLECTIONS.map((c) => \`repo:\${c}\`),
  ...RPC_METHODS.map((m) => \`rpc:\${m}?aud=*\`),
  ...CHAT_METHODS.map((m) => \`rpc:\${m}?aud=\${CHAT_AUD}\`),
].join(" ");

const url = await oauthClient.authorize(handle, { scope });`}
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Legacy: Permission Sets
        </AnchorHeading>
        <p className="mb-3 text-sm text-text-muted dark:text-text-muted-dark">
          atiproto publishes two bundled permission sets via the lexicon. These
          remain documented for completeness but are{" "}
          <strong>not currently recommended</strong> &mdash; prefer the explicit
          per-call scope form above.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          General Access
        </AnchorHeading>
        <p className="mb-1 font-mono text-sm text-text-muted dark:text-text-muted-dark">
          com.atiproto.authGeneral
        </p>
        <p className="mb-4">
          Write access to cart, subscription, and item records, plus RPC access
          to payment, feed, and public profile lookup endpoints. Does not grant
          write access to the user's profile record or access to profile
          management endpoints.
        </p>
        <p className="font-medium mb-2">Repo write</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.cart
            </code>
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.subscription
            </code>
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.item
            </code>
          </li>
        </ul>
        <p className="font-medium mb-2">RPC access</p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.payment.cart.*
            </code>{" "}
            &mdash; clone, create, get, list, put
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.payment.*
            </code>{" "}
            &mdash; list, payment and subscription CRUD
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.repo.profile.get
            </code>{" "}
            &mdash; public profile lookup
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.repo.item.*
            </code>{" "}
            &mdash; search, validate
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.repo.subscription.*
            </code>{" "}
            &mdash; search, validate
          </li>
        </ul>
        <CodeBlock
          language="text"
          code="include:com.atiproto.authGeneral?aud=did:web:atiproto.com"
        />

        <AnchorHeading as="h3" className="text-lg font-medium mt-8 mb-3">
          Enhanced Access
        </AnchorHeading>
        <p className="mb-1 font-mono text-sm text-text-muted dark:text-text-muted-dark">
          com.atiproto.authEnhanced
        </p>
        <p className="mb-4">
          Full atiproto access. Includes everything in General Access plus write
          access to the profile record and RPC access to all profile management
          endpoints.
        </p>
        <p className="font-medium mb-2">
          Additional repo write (beyond General)
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.profile
            </code>
          </li>
        </ul>
        <p className="font-medium mb-2">
          Additional RPC access (beyond General)
        </p>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.recipient.profile.get
            </code>{" "}
            &mdash; get authenticated user's profile
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.recipient.profile.put
            </code>{" "}
            &mdash; update profile settings
          </li>
        </ul>
        <CodeBlock
          language="text"
          code="include:com.atiproto.authEnhanced?aud=did:web:atiproto.com"
        />
      </section>
    </div>
  );
}
