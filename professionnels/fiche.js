import {
  getProfessional,
  getMenu,
  appHref,
  safeImage,
  departmentOf,
} from "./api.js";
import { $, el, link, picture, modes } from "./ui.js";
const slug = new URLSearchParams(location.search).get("pro");
const ACCENTS = {
  green: "#2e7d32",
  orange: "#b94b00",
  blue: "#1565c0",
  red: "#c62828",
  purple: "#6a1b9a",
  dark: "#263238",
};
function render(p) {
  document.title = p.name + " sur ZeeRoo";
  document.querySelector("link[rel=canonical]").href =
    "https://zeeroo.fr/m/?pro=" + encodeURIComponent(p.slug);
  $("#status").hidden = true;
  $("#profile").hidden = false;
  const pro = p.has_minisite === true;
  $("#profile").classList.toggle("personalized", pro);
  if (pro && ACCENTS[p.accent_color])
    $("#profile").style.setProperty("--accent", ACCENTS[p.accent_color]);
  $("#kind").textContent = pro
    ? "Mini-site professionnel"
    : "Fiche établissement";
  $("#name").textContent = p.name;
  $("#place").textContent =
    p.city +
    (departmentOf(p.postal_code)
      ? " · Département " + departmentOf(p.postal_code)
      : "");
  $("#intro").textContent =
    pro && p.tagline?.trim() ? p.tagline : p.description || modes(p);
  $("#about").textContent = pro ? p.about || "" : "";
  $("#about").hidden = !pro || !p.about;
  const image = safeImage(p.photo_url);
  if (image) $("#photo").append(picture(image, p.name, "hero-photo"));
  const logo = pro ? safeImage(p.logo_url) : null;
  if (logo) $("#brand").append(picture(logo, "Logo de " + p.name, "pro-logo"));
  $("#actions").append(
    link("Voir le menu et commander", appHref(p.slug)),
    link(
      "Découvrir les commerces à " + p.city,
      "/annuaire/?ville=" + encodeURIComponent(p.city),
      "button secondary",
    ),
  );
  $("#modes").textContent = modes(p);
  if (p.address_line)
    $("#contact").append(
      el("p", p.address_line + ", " + p.postal_code + " " + p.city),
    );
  else if (p.category === "dark_kitchen")
    $("#contact").append(
      el("p", "Cuisine sans accueil du public. Adresse non affichée."),
    );
  if (/^\+?[\d\s().-]{6,25}$/.test(p.phone || ""))
    $("#contact").append(
      link(
        "Appeler le commerce",
        "tel:" + p.phone.replace(/[^+\d]/g, ""),
        "text-link",
      ),
    );
  const days = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  for (let i = 1; i <= 7; i++) {
    const slots = (p.merchant_opening_hours || [])
      .filter((h) => h.weekday === i)
      .sort((a, b) => a.opens_at.localeCompare(b.opens_at));
    const row = el("div", null, "hours-row");
    row.append(
      el("span", days[i - 1]),
      el(
        "span",
        slots.length
          ? slots
              .map(
                (h) => h.opens_at.slice(0, 5) + " – " + h.closes_at.slice(0, 5),
              )
              .join(", ")
          : "Fermé",
      ),
    );
    $("#hours").append(row);
  }
  if (pro) {
    $("#menu").hidden = false;
    loadMenu(p.id);
  }
}
async function loadMenu(id) {
  try {
    const categories = await getMenu(id);
    $("#menu-status").textContent =
      "Les prix et disponibilités à jour sont confirmés dans l’application.";
    for (const category of categories) {
      const items = (category.menu_items || [])
        .filter((x) => x.is_available)
        .sort((a, b) => a.position - b.position);
      if (!items.length) continue;
      const section = el("section", null, "menu-category");
      section.append(el("h3", category.name));
      for (const item of items) {
        const row = el("div", null, "menu-row");
        const text = el("div");
        text.append(el("strong", item.name));
        if (item.description) text.append(el("p", item.description));
        row.append(
          text,
          el(
            "strong",
            new Intl.NumberFormat("fr-FR", {
              style: "currency",
              currency: "EUR",
            }).format(item.price_cents / 100),
          ),
        );
        section.append(row);
      }
      $("#menu-content").append(section);
    }
    if (!$("#menu-content").children.length)
      $("#menu-status").textContent =
        "Le menu sera bientôt disponible. Retrouvez le commerce dans l’application.";
  } catch {
    $("#menu-status").textContent =
      "L’aperçu du menu est indisponible. Ouvrez l’application pour consulter la carte.";
  }
}
async function load() {
  $("#retry").hidden = true;
  $("#status").textContent = "Chargement du commerce…";
  try {
    const p = await getProfessional(slug);
    if (p) render(p);
    else {
      $("#status").textContent =
        "Ce commerce est introuvable ou sa page n’est pas encore publiée.";
      $("#unavailable").hidden = false;
    }
  } catch {
    $("#status").textContent =
      "La page est momentanément indisponible. Réessayez dans un instant.";
    $("#retry").hidden = false;
  }
}
$("#retry").addEventListener("click", load);
load();
