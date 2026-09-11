import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { mpOAuthExchangeCode, mpPublicUrl, verifyOAuthState } from "@/lib/server/mp";
import { saveMpTokens } from "@/lib/server/store";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const base = mpPublicUrl();
  const fail = (reason: string) => NextResponse.redirect(`${base}/organizador?mp=${encodeURIComponent(reason)}`);

  if (!code) return fail("missing_code");
  const userId = verifyOAuthState(state);
  if (!userId) return fail("invalid_state");
  const user = await currentUser();
  if (!user || user.id !== userId) return fail("session");

  try {
    const tokens = await mpOAuthExchangeCode(code);
    await saveMpTokens(user.id, tokens);
    return NextResponse.redirect(`${base}/organizador?mp=ok`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "oauth_error";
    return fail(msg.slice(0, 80));
  }
}
