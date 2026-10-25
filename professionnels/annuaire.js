import {
  departments,
  listProfessionals,
  professionalHref,
  departmentOf,
  safeImage,
} from "./api.js";
import { $, el, link, picture, modes } from "./ui.js";
const params = new URLSearchParams(location.search);
let page = 0;
let controller;
$("#ville").value = params.get("ville") || "";
$("#recherche").value = params.get("recherche") || "";
for (const d of departments) {
  const o = el("option", d);
  o.value = d;
  $("#departement").append(o);
}
$("#departement").value = departments.includes(params.get("departement"))
  ? params.get("departement")
  : "";
function filters() {
  return {
    city: $("#ville").value,
    department: $("#departement").value,
    search: $("#recherche").value,
    page,
  };
}
function updateUrl() {
  const f = filters();
  const p = new URLSearchParams();
  if (f.city.trim()) p.set("ville", f.city.trim());
  if (f.department) p.set("departement", f.department);
  if (f.search.trim()) p.set("recherche", f.search.trim());
  history.replaceState(null, "", "/annuaire/" + (p.size ? "?" + p : ""));
}
function card(p) {
  const c = el("article", null, "pro-card");
  const image = safeImage(p.photo_url);
  if (image) c.append(picture(image, "", "card-image"));
  const body = el("div", null, "card-body");
  body.append(
    el(
      "span",
      p.has_minisite ? "Mini-site professionnel" : "Fiche établissement",
      "eyebrow",
    ),
  );
  body.append(
    el("h2", p.name),
    el(
      "p",
      p.city + " · " + (departmentOf(p.postal_code) || p.postal_code || ""),
      "location",
    ),
    el("p", p.description || modes(p), "description"),
    el("p", modes(p), "modes"),
    link("Découvrir ce commerce", professionalHref(p.slug)),
  );
  c.append(body);
  return c;
}
async function load(append = false) {
  controller?.abort();
  controller = new AbortController();
  $("#status").textContent = "Recherche des commerces…";
  $("#results").setAttribute("aria-busy", "true");
  $("#more").hidden = true;
  $("#retry").hidden = true;
  if (!append) $("#results").replaceChildren();
  try {
    const { rows, hasMore } = await listProfessionals(
      filters(),
      controller.signal,
    );
    for (const p of rows) $("#results").append(card(p));
    const n = $("#results").children.length;
    $("#status").textContent = n
      ? `${n} commerce${n > 1 ? "s" : ""} affiché${n > 1 ? "s" : ""}${hasMore ? " — d’autres résultats sont disponibles." : "."}`
      : "Aucun commerce publié ne correspond à ces critères. Essayez une autre ville ou un autre département.";
    $("#more").hidden = !hasMore;
  } catch (e) {
    if (e.name !== "AbortError") {
      $("#status").textContent =
        "L’annuaire est momentanément indisponible. Réessayez dans un instant.";
      $("#retry").hidden = false;
    }
  } finally {
    $("#results").setAttribute("aria-busy", "false");
  }
}
$("#filters").addEventListener("submit", (e) => {
  e.preventDefault();
  page = 0;
  updateUrl();
  load();
});
$("#reset").addEventListener("click", () => {
  $("#filters").reset();
  page = 0;
  updateUrl();
  load();
});
$("#more").addEventListener("click", () => {
  page++;
  load(true);
});
$("#retry").addEventListener("click", () => load(page > 0));
window.addEventListener("popstate", () => location.reload());
load();
