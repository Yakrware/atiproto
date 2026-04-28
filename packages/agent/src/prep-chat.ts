import type { Agent as ApiAgent } from "@atproto/api";

const BSKY_CHAT_SERVICE_DID = "did:web:api.bsky.chat";
const BSKY_CHAT_SERVICE_TYPE = "bsky_chat";

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
  members: readonly string[],
): Promise<void> {
  if (members.length === 0) return;

  const chat = client.withProxy(BSKY_CHAT_SERVICE_TYPE, BSKY_CHAT_SERVICE_DID);

  const avail = await chat.chat.bsky.convo.getConvoAvailability({
    members: [...members],
  });
  if (!avail.data.canChat) return;
  if (avail.data.convo?.status === "accepted") return;

  // The convo from getConvoAvailability is informational; calling
  // getConvoForMembers ensures one exists (creating if needed) and gives us
  // the canonical id to accept against.
  const got = await chat.chat.bsky.convo.getConvoForMembers({
    members: [...members],
  });
  await chat.chat.bsky.convo.acceptConvo({ convoId: got.data.convo.id });
}
