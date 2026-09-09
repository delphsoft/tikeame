const INK = "#2B1D4A";
const CREAM = "#F4EEDC";
const CORAL = "#FF6B5B";

type LogoMarkProps = {
  /** Pixel size of the (square) mark. */
  size?: number;
  /** Invert colors for use on a dark background. */
  light?: boolean;
  /** Round the outer square's corners. Turn off for the raw apple-touch icon, which iOS masks itself. */
  rounded?: boolean;
};

/**
 * The Tickeame ticket-stub mark: a rounded square with a pill-shaped ticket
 * cut by two notches and a dashed perforation, plus a coral accent dot.
 *
 * Built from plain divs (no SVG) so it renders identically as a normal React
 * component in the app and inside `next/og`'s Satori-based ImageResponse
 * (favicon, apple touch icon, OG images).
 */
export function LogoMark({ size = 28, light = false, rounded = true }: LogoMarkProps) {
  const square = light ? CREAM : INK;
  const ticket = light ? INK : CREAM;
  const notchRadius = size * 0.13;
  const notchEdge = size * 0.08;

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: rounded ? size * 0.28 : 0,
        background: square,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: size * 0.58,
          height: size * 0.26,
          borderRadius: size * 0.13,
          background: ticket,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: size * 0.14,
            borderLeft: `${Math.max(1, size * 0.035)}px dashed ${square}`,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: notchEdge,
          top: "50%",
          marginTop: -notchRadius,
          width: notchRadius * 2,
          height: notchRadius * 2,
          borderRadius: "50%",
          background: square,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: notchEdge,
          top: "50%",
          marginTop: -notchRadius,
          width: notchRadius * 2,
          height: notchRadius * 2,
          borderRadius: "50%",
          background: square,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: size * 0.12,
          right: size * 0.12,
          width: size * 0.24,
          height: size * 0.24,
          borderRadius: "50%",
          background: CORAL,
        }}
      />
    </div>
  );
}
