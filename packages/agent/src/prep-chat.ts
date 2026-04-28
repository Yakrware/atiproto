import { Agent as ApiAgent } from "@atproto/api";
import type { XrpcClient } from "@atproto/xrpc";

const BSKY_CHAT_SERVICE_DID = "did:web:api.bsky.chat";
const BSKY_CHAT_SERVICE_TYPE = "bsky_chat";

/**
 * Default chat target. The atiproto bot's bsky profile DID — the account
 * users actually receive DMs from. Distinct from `did:web:atiproto.com`
 * (the *service* DID, used as the proxy target for atiproto XRPC calls).
 */
const ATIPROTO_BSKY_DID = "did:plc:4x5dcv6u4wlkjcssto7f22nu";

export type PrepChatOption = boolean | string | string[];

function resolvePrepChatMembers(
  opt: PrepChatOption | undefined,
): string[] | undefined {
  if (opt === false) return undefined;
  if (typeof opt === "string") return opt ? [opt] : undefined;
  if (Array.isArray(opt)) return opt.length > 0 ? [...opt] : undefined;
  // true or undefined → default bot
  return [ATIPROTO_BSKY_DID];
}

/**
 * Pre-authorize a Bluesky chat conversation between the user (the authed
 * underlying agent) and the given member DIDs (typically a bot account that
 * will later send the user DMs — payment receipts, etc).
 *
 * Without this, the bot's first DM lands in the user's Requests folder,
 * which most users miss. Calling this on the user's authed agent flips the
 * convo from `request` to `accepted` so subsequent bot DMs deliver normally.
 *
 * Best-effort: skips silently if the user has chat disabled, or the convo is
 * already accepted. Throws on network/auth failure (caller is expected to
 * fire-and-forget and swallow).
 */
export async function prepChat(
  client: ApiAgent,
  members: string[],
): Promise<void> {
  if (members.length === 0) return;

  const chat = client.withProxy(BSKY_CHAT_SERVICE_TYPE, BSKY_CHAT_SERVICE_DID);

  const avail = await chat.chat.bsky.convo.getConvoAvailability({
    members,
  });
  // canChat=false means the target user has chat disabled for this requester
  // (global setting, follow-only setting, or block) — not a denial of a
  // specific prior request. Either way we can't pre-authorize, so skip.
  if (!avail.data.canChat) return;
  if (avail.data.convo?.status === "accepted") return;

  // The convo from getConvoAvailability is informational; calling
  // getConvoForMembers ensures one exists (creating if needed) and gives us
  // the canonical id to accept against.
  const got = await chat.chat.bsky.convo.getConvoForMembers({
    members,
  });
  await chat.chat.bsky.convo.acceptConvo({ convoId: got.data.convo.id });
}

/**
 * Resolve the prep-chat option to a member list and fire `prepChat` in the
 * background, swallowing all failures. No-ops when the option is `false`,
 * resolves to an empty list, or the underlying client isn't an `ApiAgent`
 * (the chat namespace and `withProxy` are only available there — plain
 * `XrpcClient` agents, used in tests, silently skip).
 */
export function firePrepChat(
  client: XrpcClient,
  opt: PrepChatOption | undefined,
): void {
  const members = resolvePrepChatMembers(opt);
  if (!members) return;
  if (!(client instanceof ApiAgent)) return;
  void prepChat(client, members).catch(() => {
    /* swallow; best-effort */
  });
}
