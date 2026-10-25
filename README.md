# zeroo_mainpage

Site web **zeeroo.fr** : la page d'accueil de ZeeRoo, à emporter ou livré, sans commission.
L'application (iOS, Android, web) est dans un autre dépôt : `cortexAI-2025/ZEROO`.

Le site est en HTML et CSS, sans cookie. Polices Outfit et Figtree (Google Fonts). JavaScript : le calculateur de l'accueil (`home.js`), le diagnostic et la démo.

| Fichier                                                                 | Contenu                                                                                                                                                                                                                                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                                                            | Page d'accueil, avec la démo intégrée en haut de page                                                                                                                                                                                                         |
| `home.css`, `home.js`                                                   | Mise en forme du site, calculateur de commission                                                                                                                                                                                                              |
| `demo/index.html`                                                       | Démo interactive de l'application (client, restaurant, livreur), fichier autonome. `?embed` masque le logo pour l'intégration dans l'accueil                                                                                                                  |
| `diagnostic.html`, `diagnostic.css`, `diagnostic.js`                    | Diagnostic restaurant ou livreur                                                                                                                                                                                                                              |
| `mentions-legales/index.html`, `confidentialite/index.html`, `404.html` | Pages légales, page introuvable. `404.html` redirige l'ancienne adresse `/demo.html` vers `/demo/`, les QR flyers `/m/<slug>` vers la fiche publique `/m/?pro=<slug>` de ce site, et les espaces privés `/pro`, `/livreur`, `/order/…` vers **app.zeeroo.fr** |
| `img/zeeroo-logo*.png`, `favicon.png`, `apple-touch-icon.png`           | Logo et icônes                                                                                                                                                                                                                                                |
| `og-image.png`                                                          | Image affichée quand on partage le lien (WhatsApp, Facebook…)                                                                                                                                                                                                 |
| `sitemap.xml`, `robots.txt`, `llms.txt`                                 | Référencement (moteurs de recherche et assistants IA)                                                                                                                                                                                                         |
| `CNAME`                                                                 | Domaine personnalisé pour GitHub Pages                                                                                                                                                                                                                        |

La démo vient du dépôt de l'application (`docs/maquette`, `python3 docs/maquette/build.py`) : copiez le fichier généré dans `demo/index.html` en gardant l'en-tête `<!doctype html>…` de ce dépôt.

## Modifier le site

- Modifiez les fichiers puis poussez sur `main` : le site est republié automatiquement en une minute environ.
- Pour l'essayer en local : `npx serve .`
- Après une modification de `home.css` ou `home.js`, changez le numéro `?v=` dans les pages pour que les navigateurs les rechargent.
- La FAQ de l'accueil est aussi décrite dans les données structurées (`FAQPage`, en haut de `index.html`) : gardez les deux identiques.

## Mise en ligne (une seule fois)

1. **GitHub** → Settings → Pages :
   - Source : « GitHub Actions » ;
   - lancez le workflow « Publier zeeroo.fr » (onglet Actions → Run workflow) ;
   - Custom domain : `zeeroo.fr` ;
   - une fois le certificat émis (quelques minutes à 24 h), cochez « Enforce HTTPS ».
2. **Recommandé** : vérifiez le domaine dans les paramètres de votre compte GitHub (Settings → Pages → Add a domain). GitHub demande d'ajouter un enregistrement TXT chez IONOS. Cela empêche un autre compte GitHub d'utiliser zeeroo.fr.
3. **IONOS** → Domaines & SSL → zeeroo.fr → DNS. Supprimez les enregistrements A, AAAA et CNAME existants pour `@` et `www` (page de parking IONOS), puis ajoutez ceux-ci :

| Type  | Nom d'hôte | Valeur                                                |
| ----- | ---------- | ----------------------------------------------------- |
| A     | @          | 185.199.108.153                                       |
| A     | @          | 185.199.109.153                                       |
| A     | @          | 185.199.110.153                                       |
| A     | @          | 185.199.111.153                                       |
| AAAA  | @          | 2606:50c0:8000::153                                   |
| AAAA  | @          | 2606:50c0:8001::153                                   |
| AAAA  | @          | 2606:50c0:8002::153                                   |
| AAAA  | @          | 2606:50c0:8003::153                                   |
| CNAME | www        | cortexai-2025.github.io                               |
| CNAME | app        | cname.vercel-dns.com (app web, voir le dépôt `ZEROO`) |

Ne touchez pas aux enregistrements MX, qui servent à l'e-mail.

4. **IONOS** : créez la boîte mail (ou une redirection) `contact@aiworkpay.fr`.

**Vérifier** : `dig +short zeeroo.fr` renvoie les 4 adresses GitHub, https://zeeroo.fr affiche la page, et https://www.zeeroo.fr y redirige.

## Annuaire, fiches et mini-sites publics

Le dossier `professionnels/` contient les modules partagés ; `annuaire/index.html` expose la recherche par ville, département (Corse et outre-mer compris) et nom, avec pagination. Le lien **Annuaire** est présent dans la navigation et le pied de page de l'accueil.

`m/index.html?pro=<slug>` présente ZeeRoo puis le professionnel. Le QR flyer conserve l'adresse courte `https://zeeroo.fr/m/<slug>` (redirection via `404.html`). Si le champ calculé `has_minisite` est vrai, la personnalisation Pro et un aperçu de la carte s'affichent ; sinon, la fiche simple reste disponible à la même adresse. Le bouton de commande renvoie vers l'application. Le QR vitrine vise directement `https://app.zeeroo.fr/m/<slug>` pour les clients et livreurs.

Les données proviennent de l'API publique Supabase avec sa clé **publishable**, sous les règles RLS existantes. Ni clé secrète ni session utilisateur dans ce site. Seuls les commerces `is_published=true` sont demandés. L'adresse calculée masque celle des cuisines sans accueil du public. Les résultats vides et les erreurs réseau sont explicites ; aucun commerce de démonstration n'est ajouté. Publier sa fiche depuis l'application avant de diffuser les supports.

Validation locale : `npm ci` puis `npm test` (requêtes filtrées, Corse/outre-mer, pagination, variantes simple/Pro, erreurs, absence d'injection HTML et compatibilité des anciens liens). Le workflow de publication exclut les dépendances et les tests de l'archive publique.
