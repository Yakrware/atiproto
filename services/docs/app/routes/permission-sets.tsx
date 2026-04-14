import { CodeBlock } from "~/components/CodeBlock";
import { AnchorHeading } from "~/components/AnchorHeading";

export default function PermissionSets() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Permission Sets</h1>
      <p className="text-text-muted dark:text-text-muted-dark mb-8">
        OAuth permission sets for scoping access to a
        <span className="text-primary dark:text-primary-dark">TIP</span>roto
        resources. Use these when requesting authorization to control exactly
        what your application can do.
      </p>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Overview
        </AnchorHeading>
        <p className="mb-3">
          atiproto defines two permission sets that bundle granular ATProto
          scopes into named groups. Clients reference them via{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            include:
          </code>{" "}
          scope strings during OAuth authorization, passing the service audience
          at invocation time.
        </p>
        <p className="mb-3">
          Both permission sets use{" "}
          <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
            inheritAud
          </code>{" "}
          for their RPC permissions, meaning the audience is provided by the
          caller rather than hard-coded in the definition.
        </p>
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          General Access
        </AnchorHeading>
        <p className="mb-1 font-mono text-sm text-text-muted dark:text-text-muted-dark">
          com.atiproto.authGeneral
        </p>
        <p className="mb-4">
          Write access to cart, subscription, and tip records, plus RPC access
          to payment, feed, and public profile lookup endpoints. Does not grant
          write access to the user's profile record or access to profile
          management endpoints.
        </p>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Repo write
        </AnchorHeading>
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
              com.atiproto.tip
            </code>
          </li>
        </ul>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          RPC access
        </AnchorHeading>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.account.cart.*
            </code>{" "}
            &mdash; clone, create, get, list, put
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.feed.*
            </code>{" "}
            &mdash; list, tip and subscription CRUD
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.repo.profile.get
            </code>{" "}
            &mdash; public profile lookup
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.repo.tip.*
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

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Usage
        </AnchorHeading>
        <CodeBlock
          language="text"
          code="include:com.atiproto.authGeneral?aud=did:web:atiproto.com%23payments"
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
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

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Additional repo write (beyond General)
        </AnchorHeading>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.profile
            </code>
          </li>
        </ul>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Additional RPC access (beyond General)
        </AnchorHeading>
        <ul className="list-disc pl-6 space-y-1 mb-4">
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.account.profile.get
            </code>{" "}
            &mdash; get authenticated user's profile
          </li>
          <li>
            <code className="px-1.5 py-0.5 bg-surface-alt dark:bg-surface-alt-dark rounded text-sm font-mono">
              com.atiproto.account.profile.put
            </code>{" "}
            &mdash; update profile settings
          </li>
        </ul>

        <AnchorHeading as="h3" className="text-lg font-medium mt-6 mb-3">
          Usage
        </AnchorHeading>
        <CodeBlock
          language="text"
          code="include:com.atiproto.authEnhanced?aud=did:web:atiproto.com%23payments"
        />
      </section>

      <section className="mb-10">
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          OAuth Client Example
        </AnchorHeading>
        <p className="mb-3">
          Request a permission set as part of an OAuth scope string:
        </p>
        <CodeBlock
          code={`const url = await oauthClient.authorize(handle, {
  scope: "atproto transition:generic include:com.atiproto.authGeneral?aud=did:web:atiproto.com%23payments",
});`}
        />
      </section>

      <section>
        <AnchorHeading as="h2" className="text-xl font-semibold mb-4">
          Choosing a Permission Set
        </AnchorHeading>
        <p className="mb-3">
          Use <strong>General Access</strong> when your application only needs
          to create tips, subscriptions, and carts, and look up public profiles.
          This is the right choice for most integrations.
        </p>
        <p className="mb-3">
          Use <strong>Enhanced Access</strong> when your application also needs
          to manage the user's atiproto profile settings (e.g. toggling whether
          they accept tips or subscriptions).
        </p>
      </section>
    </div>
  );
}
