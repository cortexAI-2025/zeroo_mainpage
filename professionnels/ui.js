export const $ = (s) => document.querySelector(s);
export function el(tag, text, className) {
  const n = document.createElement(tag);
  if (text != null) n.textContent = text;
  if (className) n.className = className;
  return n;
}
export function link(text, href, className = "button") {
  const a = el("a", text, className);
  a.href = href;
  return a;
}
export function picture(src, alt, className) {
  const img = el("img", null, className);
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";
  return img;
}
export function modes(p) {
  return (
    [
      p.offers_pickup ? "À emporter" : null,
      p.offers_delivery ? "Livraison" : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Informations et menu dans l’application"
  );
}
