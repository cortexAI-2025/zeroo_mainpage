const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const privacy=fs.readFileSync(path.join(root,'confidentialite/index.html'),'utf8');
test('le site public n’embarque plus d’annuaire général ni de clé Supabase',()=>{
  for(const f of ['directory.js','directory-config.js','directory.css'])assert.equal(fs.existsSync(path.join(root,f)),false,f);
  assert.doesNotMatch(html,/directory(-config)?\.(js|css)|directory-claim|public-directory|supabase/i);
});
test('la section annuaire renvoie uniquement vers les restaurants affiliés',()=>{
  assert.match(html,/id="annuaire"/);
  assert.match(html,/href="https:\/\/app\.zeeroo\.fr\/decouvrir"/);
  assert.doesNotMatch(html,/2[\s  ]?390|SIRET|SIREN|revendiqu/i);
});
test('la FAQ visible et le JSON-LD décrivent le même annuaire',()=>{
  const answer='L’annuaire de l’application (app.zeeroo.fr/decouvrir) liste uniquement les restaurants affiliés à ZEEROO.';
  assert.equal(html.split(answer).length-1,2);
  assert.doesNotMatch(html,/affiliés à ZEEROO ou non/);
});
test('la politique de confidentialité ne promet pas d’annuaire général',()=>{
  assert.match(privacy,/ne liste que les restaurants affiliés/);
  assert.doesNotMatch(privacy,/annuaire global/i);
});
