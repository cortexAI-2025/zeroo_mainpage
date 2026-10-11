# zeroo-mainpage

Site web **zeroo.online** : la page d'accueil de Zéroo, click-and-collect et livraison sans commission.
L'application (iOS, Android, web) est dans un autre dépôt : `cortexAI-2025/ZEROO`.

Le site est en HTML et CSS : pas de cookie, aucune ressource externe hormis la police Plus Jakarta Sans. Seules la démo (`/demo/`) et la page de diagnostic contiennent du JavaScript.

| Fichier | Contenu |
|---|---|
| `index.html` | Page d'accueil (concept, démo, tarifs, FAQ, contact) |
| `diagnostic.html`, `diagnostic.js`, `diagnostic.css` | Diagnostic gratuit restaurateurs et livreurs |
| `mentions-legales/index.html` | Mentions légales |
| `confidentialite/index.html` | Politique de confidentialité |
| `demo/index.html` | Démo interactive de l'application (client, restaurant, livreur), fichier autonome |
| `demo.html` | Démo servie à la racine (lien du bouton « Tester la démo ») |
| `404.html` | Page introuvable |
| `style.css` | Mise en forme (couleurs de la marque, fond clair) |
| `logo-zeroo.png`, `logo-zeroo.svg` | Logo |
| `favicon.png`, `favicon.svg`, `apple-touch-icon.png` | Icônes |
| `og-image.png` | Image affichée quand on partage le lien (WhatsApp, Facebook…) |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Référencement (moteurs de recherche et assistants IA) |
| `CNAME` | Domaine personnalisé pour GitHub Pages (`zeroo.online`) |
| `.github/workflows/deploy.yml` | Publication automatique sur GitHub Pages |

Les boutons ouvrent un e-mail prérempli vers `contact@aiworkpay.fr` ou la page de diagnostic.

## Tarifs affichés

Grille validée, HT, avec 30 jours d'essai gratuit : Restaurant Start 19,99 € HT/mois ou 199,99 € HT/an ; Restaurant Pro multisite 29,99 € HT/mois ou 299,99 € HT/an ; Livreur Start 14,99 € HT/mois ou 149,99 € HT/an. Ces montants apparaissent dans la page d'accueil (tarifs, simulateur, FAQ) : gardez-les identiques à l'application et à `llms.txt`.

## Modifier le site

- Modifiez les fichiers puis poussez sur `main` : le site est republié automatiquement en une minute environ.
- Pour l'essayer en local : `npx serve .`
- Après une modification de `style.css`, changez le numéro `?v=` dans les pages pour que les navigateurs rechargent la feuille de style.
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

## Avant lancement commercial

Vérifier les mentions légales (éditeur, SIRET, hébergeur) et l'URL de l'application avant de publier. Le site ne doit annoncer aucune disponibilité qui n'est pas confirmée.
