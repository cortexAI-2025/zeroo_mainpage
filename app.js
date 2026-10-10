'use strict';
const money = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(value);
const revenue=document.querySelector('#revenue'),rate=document.querySelector('#rate');
function calculate(){document.querySelector('#revenue-value').textContent=money(Number(revenue.value));document.querySelector('#rate-value').textContent=rate.value+' %';document.querySelector('#commission').textContent=money(Number(revenue.value)*Number(rate.value)/100)}
revenue.addEventListener('input',calculate);rate.addEventListener('input',calculate);calculate();
let count=0,total=0;
const feedback=document.querySelector('#demo-feedback'),checkout=document.querySelector('#checkout');
function basket(){document.querySelector('#basket-label').textContent=count?count+' article'+(count>1?'s':'')+' · '+money(total):'Votre panier est vide';checkout.disabled=count===0}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active))});document.querySelectorAll('.dish').forEach(dish=>dish.hidden=button.dataset.filter!=='all'&&dish.dataset.category!==button.dataset.filter)}));
document.querySelectorAll('.dish').forEach(dish=>dish.addEventListener('click',()=>{count++;total+=Number(dish.dataset.price);basket();feedback.textContent=dish.dataset.name+' ajouté à votre panier de démonstration.'}));
document.querySelector('#reset').addEventListener('click',()=>{count=0;total=0;basket();feedback.textContent='Panier vidé. À vous de choisir !'});
checkout.addEventListener('click',()=>{feedback.textContent='Démo terminée : vous récupéreriez votre commande au restaurant. Aucune commande réelle n’a été envoyée.';count=0;total=0;basket()});
document.querySelector('#year').textContent=new Date().getFullYear();
