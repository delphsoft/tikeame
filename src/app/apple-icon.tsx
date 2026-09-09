import { ImageResponse } from "next/og";
import { LogoMark } from "@/components/LogoMark";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  // iOS applies its own corner mask, so the raw touch icon stays a solid square.
  return new ImageResponse(<LogoMark size={180} rounded={false} />, size);
}
