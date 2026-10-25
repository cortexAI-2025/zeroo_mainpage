const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const { JSDOM } = require("jsdom");
let serial = 0;
const base = () => import("../professionnels/api.js");
function setup(page, url) {
  const dom = new JSDOM(
    fs.readFileSync(new URL("../" + page, "file://" + __filename), "utf8"),
    { url },
  );
  global.document = dom.window.document;
  global.window = dom.window;
  global.location = dom.window.location;
  global.history = dom.window.history;
  return dom;
}
const settle = () => new Promise((r) => setTimeout(r, 15));
const merchant = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "chez-test",
  name: "Chez Test",
  city: "Versailles",
  postal_code: "78000",
  category: "restaurant",
  description: "Cuisine maison",
  is_published: true,
  has_minisite: false,
  offers_pickup: true,
  offers_delivery: false,
  tagline: "Option secrète Pro",
  about: "Présentation personnalisée",
  accent_color: "red",
  logo_url: "https://example.test/logo.png",
  merchant_opening_hours: [],
};

test("départements métropole, Corse et outre-mer", async () => {
  const { departmentOf } = await base();
  for (const [p, d] of [
    ["75001", "75"],
    ["78000", "78"],
    ["20000", "2A"],
    ["20190", "2A"],
    ["20200", "2B"],
    ["20620", "2B"],
    ["97100", "971"],
    ["97400", "974"],
    ["97600", "976"],
    ["98000", null],
    ["", null],
  ])
    assert.equal(departmentOf(p), d);
});
test("requête publique filtrée côté API et paginée", async () => {
  const { directoryQuery } = await base();
  const p = directoryQuery({
    city: "Paris",
    department: "75",
    search: "Bistro",
    page: 2,
  });
  assert.equal(p.get("is_published"), "eq.true");
  assert.equal(p.get("city"), "ilike.*Paris*");
  assert.equal(p.get("postal_code"), "like.75*");
  assert.equal(p.get("offset"), "48");
  assert.equal(p.get("limit"), "25");
  assert(!p.get("select").includes("owner_id"));
  assert.throws(() => directoryQuery({ department: "bad" }));
});
test("filtres Corse distincts", async () => {
  const { directoryQuery } = await base();
  assert.equal(
    directoryQuery({ department: "2A" }).get("and"),
    "(postal_code.gte.20000,postal_code.lt.20200)",
  );
  assert.equal(
    directoryQuery({ department: "2B" }).get("and"),
    "(postal_code.gte.20200,postal_code.lt.21000)",
  );
});
test("liens vitrine/application distincts et images non sûres refusées", async () => {
  const { professionalHref, appHref, safeImage } = await base();
  assert.equal(professionalHref("chez-test"), "/m/?pro=chez-test");
  assert.equal(appHref("chez-test"), "https://app.zeeroo.fr/m/chez-test");
  assert.equal(safeImage("javascript:alert(1)"), null);
  assert.equal(safeImage("data:image/svg+xml,abc"), null);
  assert.equal(
    safeImage("https://example.test/a.jpg"),
    "https://example.test/a.jpg",
  );
});
test("les fiches non publiées et les slugs invalides ne deviennent pas des exemples", async () => {
  const { getProfessional } = await base();
  let called = 0;
  global.fetch = async () => {
    called++;
    return { ok: true, json: async () => [] };
  };
  assert.equal(await getProfessional("<script>"), null);
  assert.equal(called, 0);
  assert.equal(await getProfessional("non-publie"), null);
});
test("fiche simple : présentation ZeeRoo, CTA app, personnalisation Pro masquée", async () => {
  const dom = setup("m/index.html", "https://zeeroo.fr/m/?pro=chez-test");
  global.fetch = async () => ({ ok: true, json: async () => [merchant] });
  await import("../professionnels/fiche.js?case=" + serial++);
  await settle();
  assert.equal(document.querySelector("#profile").hidden, false);
  assert.equal(
    document.querySelector("#kind").textContent,
    "Fiche établissement",
  );
  assert.equal(document.querySelector("#about").hidden, true);
  assert.equal(document.querySelector("#brand").children.length, 0);
  assert(
    !document.querySelector("#intro").textContent.includes("Option secrète"),
  );
  assert.equal(
    document.querySelector("#actions a").href,
    "https://app.zeeroo.fr/m/chez-test",
  );
  assert.match(
    document.querySelector(".banner").textContent,
    /Bienvenue sur ZeeRoo/,
  );
  dom.window.close();
});
test("mini-site Pro actif : personnalisation et aperçu menu", async () => {
  const dom = setup("m/index.html", "https://zeeroo.fr/m/?pro=chez-test");
  global.fetch = async (url) => ({
    ok: true,
    json: async () =>
      url.includes("/menu_categories?")
        ? [
            {
              name: "Plats",
              menu_items: [
                {
                  name: "Tajine",
                  price_cents: 1200,
                  is_available: true,
                  position: 0,
                },
              ],
            },
          ]
        : [{ ...merchant, has_minisite: true }],
  });
  await import("../professionnels/fiche.js?case=" + serial++);
  await settle();
  assert.equal(
    document.querySelector("#kind").textContent,
    "Mini-site professionnel",
  );
  assert.equal(
    document.querySelector("#intro").textContent,
    "Option secrète Pro",
  );
  assert.equal(document.querySelector("#about").hidden, false);
  assert.equal(document.querySelector("#brand img").src, merchant.logo_url);
  assert.match(document.querySelector("#menu-content").textContent, /Tajine/);
  assert.match(document.querySelector("#menu-content").textContent, /12,00/);
  dom.window.close();
});
test("les données métier ne peuvent pas injecter de HTML", async () => {
  const dom = setup("m/index.html", "https://zeeroo.fr/m/?pro=chez-test");
  global.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        ...merchant,
        name: "<img src=x onerror=alert(1)>",
        description: "<script>bad()</script>",
      },
    ],
  });
  await import("../professionnels/fiche.js?case=" + serial++);
  await settle();
  assert.equal(document.querySelector("#name img"), null);
  assert.equal(document.querySelector("#intro script"), null);
  assert.match(document.querySelector("#name").textContent, /<img/);
  dom.window.close();
});
test("annuaire vide : état honnête et filtres restaurés", async () => {
  const dom = setup(
    "annuaire/index.html",
    "https://zeeroo.fr/annuaire/?ville=Versailles&departement=78",
  );
  let request;
  global.fetch = async (url) => {
    request = url;
    return { ok: true, json: async () => [] };
  };
  await import("../professionnels/annuaire.js?case=" + serial++);
  await settle();
  assert.equal(document.querySelector("#ville").value, "Versailles");
  assert.equal(document.querySelector("#departement").value, "78");
  assert.equal(new URL(request).searchParams.get("postal_code"), "like.78*");
  assert.match(
    document.querySelector("#status").textContent,
    /Aucun commerce publié/,
  );
  assert.equal(document.querySelector("#results").children.length, 0);
  dom.window.close();
});
test("annuaire : fiche publique et erreur réseau réessayable", async () => {
  const dom = setup("annuaire/index.html", "https://zeeroo.fr/annuaire/");
  global.fetch = async () => ({ ok: true, json: async () => [merchant] });
  await import("../professionnels/annuaire.js?case=" + serial++);
  await settle();
  assert.equal(document.querySelector("#results h2").textContent, "Chez Test");
  assert.match(
    document.querySelector("#results a").href,
    /\/m\/\?pro=chez-test$/,
  );
  global.fetch = async () => {
    throw Error("offline");
  };
  document
    .querySelector("#filters")
    .dispatchEvent(new dom.window.Event("submit", { cancelable: true }));
  await settle();
  assert.equal(document.querySelector("#retry").hidden, false);
  assert.match(document.querySelector("#status").textContent, /indisponible/);
  dom.window.close();
});
test("anciens QR commerces restent sur la vitrine ; espaces privés restent dans app", () => {
  const source = fs.readFileSync(
    new URL("../404.html", "file://" + __filename),
    "utf8",
  );
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1];
  const vm = require("node:vm");
  for (const [pathname, target] of [
    ["/m/chez-test", "/m/?pro=chez-test"],
    ["/pro", "https://app.zeeroo.fr/pro"],
    ["/livreur/compte", "https://app.zeeroo.fr/livreur/compte"],
  ]) {
    let dest;
    vm.runInNewContext(script, {
      URLSearchParams,
      location: { pathname, search: "", hash: "", replace: (u) => (dest = u) },
    });
    assert.equal(dest, target);
  }
});
