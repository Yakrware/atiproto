import { Agent as ApiAgent } from "@atproto/api";
import type { XrpcClient } from "@atproto/xrpc";
import { createFetchHandler } from "./agent.js";

const BSKY_CHAT_SERVICE_DID = "did:web:api.bsky.chat";
const BSKY_CHAT_SERVICE_TYPE = "bsky_chat";

/**
 * The atiproto bot's bsky profile DID — the account users actually receive
 * payment receipt DMs from. Distinct from `did:web:atiproto.com` (the
 * *service* DID, used as the proxy target for atiproto XRPC calls).
 */
export const ATIPROTO_BSKY_DID = "did:plc:4x5dcv6u4wlkjcssto7f22nu";

/**
 * Pre-authorize a Bluesky chat conversation between the authenticated user
 * and the given member DIDs (typically a bot account that will later send
 * the user DMs — payment receipts, etc).
 *
 * Without this, the bot's first DM lands in the user's Requests folder,
 * which most users miss. Calling this on the user's authed agent flips the
 * convo from `request` to `accepted` so subsequent bot DMs deliver normally.
 *
 * Requires the user's OAuth scope to grant `rpc:chat.bsky.convo.*` on the
 * Bluesky chat audience (`did:web:api.bsky.chat#bsky_chat`). Skips silently
 * if the user has chat disabled or the convo is already accepted. Throws on
 * network/auth failure — callers typically want to fire-and-forget and
 * swallow rejections.
 *
 * @example
 *   import { Agent as BskyAgent } from "@atproto/api";
 *   import { prepChatForReceipts, ATIPROTO_BSKY_DID } from "@atiproto/agent";
 *
 *   const bskyAgent = new BskyAgent(oauthSession);
 *   void prepChatForReceipts(bskyAgent, [ATIPROTO_BSKY_DID]).catch(() => {});
 */
export async function prepChatForReceipts(
  client: XrpcClient,
  members: string[],
): Promise<void> {
  if (members.length === 0) return;

  const fetchHandler = createFetchHandler(
    client,
    BSKY_CHAT_SERVICE_TYPE,
    BSKY_CHAT_SERVICE_DID,
  );
  const chat = new ApiAgent(fetchHandler);

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
  const convoId = got.data.convo.id;
  await chat.chat.bsky.convo.acceptConvo({ convoId });
  // acceptConvo alone moves the convo out of *this user's* Requests folder,
  // but the convo isn't bidirectionally accepted until they actually post a
  // message in it. Without this step the bot's later DMs can still land in
  // Requests on the bot side or fail to deliver. Sending an explicit
  // confirmation message closes the loop.
  await chat.chat.bsky.convo.sendMessage({
    convoId,
    message: { text: "I will receive receipts in this chat" },
  });
}
