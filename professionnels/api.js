import { CONFIG } from "./config.js";
export const PAGE_SIZE = 24;
const fields =
  "id,slug,name,category,city,postal_code,description,photo_url,offers_pickup,offers_delivery,has_minisite,is_open_now";
export const departments = [
  ...Array.from({ length: 95 }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  ).filter((x) => x !== "20"),
  "2A",
  "2B",
  "971",
  "972",
  "973",
  "974",
  "976",
].sort();
export function departmentOf(postcode) {
  if (!/^\d{5}$/.test(postcode || "")) return null;
  if (/^20/.test(postcode)) return postcode < "20200" ? "2A" : "2B";
  const overseas = postcode.slice(0, 3);
  return departments.includes(overseas)
    ? overseas
    : departments.includes(postcode.slice(0, 2))
      ? postcode.slice(0, 2)
      : null;
}
export function professionalHref(slug) {
  return "/m/?pro=" + encodeURIComponent(slug);
}
export function appHref(slug) {
  return CONFIG.appUrl + "/m/" + encodeURIComponent(slug);
}
export function safeImage(value) {
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.href : null;
  } catch {
    return null;
  }
}
export function directoryQuery({
  city = "",
  department = "",
  search = "",
  page = 0,
} = {}) {
  const p = new URLSearchParams({
    select: fields,
    is_published: "eq.true",
    order: "name.asc,id.asc",
    limit: String(PAGE_SIZE + 1),
    offset: String(Math.max(0, page) * PAGE_SIZE),
  });
  const pattern = (v) => v.trim().replace(/[\\%_*]/g, "\\$&");
  if (city.trim()) p.set("city", "ilike.*" + pattern(city) + "*");
  if (search.trim()) p.set("name", "ilike.*" + pattern(search) + "*");
  if (department) {
    if (!departments.includes(department))
      throw new Error("invalid_department");
    if (department === "2A")
      p.set("and", "(postal_code.gte.20000,postal_code.lt.20200)");
    else if (department === "2B")
      p.set("and", "(postal_code.gte.20200,postal_code.lt.21000)");
    else p.set("postal_code", "like." + department + "*");
  }
  return p;
}
export async function request(table, params, signal) {
  const res = await fetch(
    CONFIG.supabaseUrl + "/rest/v1/" + table + "?" + params,
    {
      headers: { apikey: CONFIG.publishableKey, Accept: "application/json" },
      signal,
    },
  );
  if (!res.ok) throw new Error("service_unavailable");
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("invalid_response");
  return data;
}
export async function listProfessionals(filters, signal) {
  const rows = await request("merchants", directoryQuery(filters), signal);
  return { rows: rows.slice(0, PAGE_SIZE), hasMore: rows.length > PAGE_SIZE };
}
export async function getProfessional(slug, signal) {
  if (!/^[a-z0-9][a-z0-9-]{0,119}$/.test(slug || "")) return null;
  const p = new URLSearchParams({
    select:
      fields +
      ",phone,address_line:merchant_address_line,logo_url,tagline,about,accent_color,merchant_opening_hours(weekday,opens_at,closes_at)",
    slug: "eq." + slug,
    is_published: "eq.true",
    limit: "1",
  });
  const rows = await request("merchants", p, signal);
  return rows[0] || null;
}
export async function getMenu(merchantId, signal) {
  const p = new URLSearchParams({
    select:
      "name,position,menu_items(id,name,description,price_cents,photo_url,is_available,position)",
    merchant_id: "eq." + merchantId,
    is_active: "eq.true",
    order: "position.asc",
  });
  return request("menu_categories", p, signal);
}
