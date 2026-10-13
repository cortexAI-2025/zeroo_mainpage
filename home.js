'use strict';
// Calculateur de commission et année du pied de page. Le reste de la page fonctionne sans JavaScript.
const euros = (v) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v);
const revenue = document.getElementById('revenue');
const rate = document.getElementById('rate');
function calculate() {
  document.getElementById('revenue-value').textContent = euros(Number(revenue.value));
  document.getElementById('rate-value').textContent = rate.value + ' %';
  document.getElementById('commission').textContent = euros((Number(revenue.value) * Number(rate.value)) / 100);
}
if (revenue && rate) {
  revenue.addEventListener('input', calculate);
  rate.addEventListener('input', calculate);
  calculate();
}
document.getElementById('year').textContent = new Date().getFullYear();
