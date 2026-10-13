# zeroo_mainpage

Site web **zeroo.online** : la page d'accueil de ZeeRoo, à emporter ou livré, sans commission.
L'application (iOS, Android, web) est dans un autre dépôt : `cortexAI-2025/ZEROO`.

Le site est en HTML et CSS, sans cookie. Polices Outfit et Figtree (Google Fonts). JavaScript : le calculateur de l'accueil (`home.js`), le diagnostic et la démo.

| Fichier | Contenu |
|---|---|
| `index.html` | Page d'accueil, avec la démo intégrée en haut de page |
| `home.css`, `home.js` | Mise en forme du site, calculateur de commission |
| `demo/index.html` | Démo interactive de l'application (client, restaurant, livreur), fichier autonome. `?embed` masque le logo pour l'intégration dans l'accueil |
| `demo.html` | Ancienne adresse de la démo, redirige vers `/demo/` |
| `diagnostic.html`, `diagnostic.css`, `diagnostic.js` | Diagnostic restaurant ou livreur |
| `mentions-legales/index.html`, `confidentialite/index.html`, `404.html` | Pages légales, page introuvable |
| `img/zeeroo-logo*.png`, `favicon.png`, `apple-touch-icon.png` | Logo et icônes |
| `og-image.png` | Image affichée quand on partage le lien (WhatsApp, Facebook…) |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Référencement (moteurs de recherche et assistants IA) |
| `CNAME` | Domaine personnalisé pour GitHub Pages |

La démo vient du dépôt de l'application (`docs/maquette`, `python3 docs/maquette/build.py`) : copiez le fichier généré dans `demo/index.html` en gardant l'en-tête `<!doctype html>…` de ce dépôt.

## Modifier le site

- Modifiez les fichiers puis poussez sur `main` : le site est republié automatiquement en une minute environ.
- Pour l'essayer en local : `npx serve .`
- Après une modification de `home.css` ou `home.js`, changez le numéro `?v=` dans les pages pour que les navigateurs les rechargent.
- La FAQ de l'accueil est aussi décrite dans les données structurées (`FAQPage`, en haut de `index.html`) : gardez les deux identiques.

## Mise en ligne (une seule fois)

1. **GitHub** → Settings → Pages :
   - Source : « GitHub Actions » ;
   - lancez le workflow « Publier zeroo.online » (onglet Actions → Run workflow) ;
   - Custom domain : `zeroo.online` ;
   - une fois le certificat émis (quelques minutes à 24 h), cochez « Enforce HTTPS ».
2. **Recommandé** : vérifiez le domaine dans les paramètres de votre compte GitHub (Settings → Pages → Add a domain). GitHub demande d'ajouter un enregistrement TXT chez IONOS. Cela empêche un autre compte GitHub d'utiliser zeroo.online.
3. **IONOS** → Domaines & SSL → zeroo.online → DNS. Supprimez les enregistrements A, AAAA et CNAME existants pour `@` et `www` (page de parking IONOS), puis ajoutez ceux-ci :

| Type | Nom d'hôte | Valeur |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | cortexai-2025.github.io |

Ne touchez pas aux enregistrements MX, qui servent à l'e-mail.

4. **IONOS** : créez la boîte mail (ou une redirection) `contact@aiworkpay.fr`.

**Vérifier** : `dig +short zeroo.online` renvoie les 4 adresses GitHub, https://zeroo.online affiche la page, et https://www.zeroo.online y redirige.
