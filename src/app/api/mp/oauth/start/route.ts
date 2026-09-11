import { NextResponse } from "next/server";
import { currentUser } from "@/lib/server/auth";
import { mpOAuthAuthorizeUrl, mpOAuthConfigured, mpPublicUrl, signOAuthState } from "@/lib/server/mp";

export async function GET() {
  const user = await currentUser();
  if (!user || (user.role !== "organizer" && user.role !== "admin")) {
    return NextResponse.redirect(`${mpPublicUrl()}/login?as=organizer&next=/organizador`);
  }
  if (!mpOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Falta MP_CLIENT_SECRET. En Mercado Pago → tu aplicación, copiá Client ID y Client Secret, y poné redirect https://tickeame.com.ar/api/mp/oauth/callback",
      },
      { status: 503 },
    );
  }
  const state = signOAuthState(user.id);
  const url = mpOAuthAuthorizeUrl(state);
  const res = NextResponse.redirect(url);
  res.cookies.set("mp_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.VERCEL === "1",
    maxAge: 15 * 60,
  });
  return res;
}
