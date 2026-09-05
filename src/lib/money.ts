export function fmtARS(n: number) {
  return "$" + Math.round(n).toLocaleString("es-AR");
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}
