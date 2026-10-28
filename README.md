# zeroo_mainpage

Site web **zeeroo.fr** : la page d'accueil de ZeeRoo, à emporter ou livré, sans commission.
L'application (iOS, Android, web) est dans un autre dépôt : `cortexAI-2025/ZEROO`.

Le site est en HTML et CSS, sans cookie. Polices Outfit et Figtree (Google Fonts). JavaScript : le calculateur de l'accueil (`home.js`), le diagnostic et la démo.

| Fichier | Contenu |
|---|---|
| `index.html` | Page d'accueil, avec la démo intégrée en haut de page |
| `home.css`, `premium.css`, `site.css`, `home.js` | Mise en forme du site (`site.css` : application en ligne, annuaire, mini-site, QR), calculateur de commission |
| `demo/index.html` | Démo interactive fidèle à l'application (annuaire, commande, Happy Hour, formules Start et Pro, livraison ; client, restaurant, livreur), fichier autonome. `?embed` masque le logo pour l'intégration dans l'accueil |
| `la-petite-pause/index.html`, `la-petite-pause/qr.svg` | Mini-site de l'établissement La Petite Pause (Trappes) : infos pratiques, horaires, appel, itinéraire, commande ZeeRoo, QR code. `noindex` tant que l'établissement n'a pas ouvert son espace dans l'application (`app.zeeroo.fr/m/la-petite-pause`) |
| `diagnostic.html`, `diagnostic.css`, `diagnostic.js` | Diagnostic restaurant ou livreur |
| `mentions-legales/index.html`, `confidentialite/index.html`, `404.html` | Pages légales, page introuvable. `404.html` redirige l'ancienne adresse `/demo.html` vers `/demo/`, et les liens de l'app (`/m/<slug>` des QR codes, `/pro`, `/livreur`, `/order/…`) vers l'app web **app.zeeroo.fr** |
| `img/zeeroo-logo*.png` (+ `-dark`, `-baseline`), `img/zeeroo-kangaroo.png`, `img/plats.jpg`, `img/qr-app.svg`, `favicon*.png`, `apple-touch-icon.png`, `img/icon-*.png` | Logos (fond clair et fond sombre), kangourou, photo des plats, QR code de l'application, icônes |
| `og-image.png` | Image affichée quand on partage le lien (WhatsApp, Facebook…) |
| `sitemap.xml`, `robots.txt`, `llms.txt` | Référencement (moteurs de recherche et assistants IA) |
| `CNAME` | Domaine personnalisé pour GitHub Pages |

La démo vient du dépôt de l'application (`docs/maquette`, `python3 docs/maquette/build.py`) : copiez le fichier généré dans `demo/index.html` en gardant l'en-tête `<!doctype html>…` de ce dépôt (tout ce qui précède `<title>` dans l'ancien fichier).

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
| CNAME | app | cname.vercel-dns.com (app web, voir le dépôt `ZEROO`) |

Ne touchez pas aux enregistrements MX, qui servent à l'e-mail.

4. **IONOS** : créez la boîte mail (ou une redirection) `contact@aiworkpay.fr`.

**Vérifier** : `dig +short zeeroo.fr` renvoie les 4 adresses GitHub, https://zeeroo.fr affiche la page, et https://www.zeeroo.fr y redirige.

## Révision vitrine (octobre 2026)

- Bulle WhatsApp vers AiWorkPay : +33 6 02 40 51 47 (lien explicite, aucune conversation automatique).
- Formulaire de contact : ouvre le client e-mail local via `mailto:` ; pas de backend ni de promesse d'envoi automatique. Vérifier sur mobile et desktop.
- Page `/cgu/` : conditions d'utilisation de la vitrine et informations précontractuelles indicatives ; à faire valider juridiquement avant exploitation commerciale.
- Confidentialité mise à jour pour mentionner Google Fonts et WhatsApp.
- La démo est une simulation, non une commande réelle. Les paiements et comptes sont dans `app.zeeroo.fr`.

## Annuaire public global — import Yvelines (28/10/2026)

L’annuaire est intégré dans `index.html#annuaire`, sur **zeeroo.fr**, en liste simple sans page/fiches générées. Il est distinct de l’annuaire des affiliés de l’application. Les liens de navigation « Annuaire des pros » restent sur cette section ; un lien explicitement nommé mène séparément aux affiliés.

- Source fournie : `annuaire_yvelines_etablissements.csv`, 3 396 lignes ; SHA-256 `bff079596395c09eb9e270f6f0c622b38791b39eca8fbba731e520509782b6e4`.
- Filtre : code NAF établissement **56.10C**, statut administratif **A**. 2 390 SIRET distincts retenus, 1 006 autres activités exclues. Enseigne, ou raison sociale lorsque l’enseigne manque. Données administratives consultées le 25/10/2026 ; contacts, horaires et services non inventés.
- Source métier : `public.directory_businesses`, séparée de `merchants`, abonnements et comptes. La recherche publique est paginée par 25, avec nom/ville/code postal/SIRET et filtre de commune.
- Aucun mini-site créé. Le seul rapprochement statique ajouté relie le SIRET `84749958900020`, raison sociale « LA PEITE PAUSE », à `/la-petite-pause/`, déjà existant : nom et adresse du 15 boulevard Martin Luther King à Trappes concordent. L’enseigne affichée reprend « La Petite Pause » du mini-site ; la raison sociale source est conservée. Les mini-sites applicatifs ne sont reliés qu’après rattachement vérifié d’un commerce existant, publié et disposant du mini-site.
- `directory-config.js` contient uniquement l’URL du projet et une clé **publique publishable** ; aucune clé privilégiée.

### Revendications

Le bouton par ligne ouvre un formulaire de **demande** de revendication. Un professionnel peut créer son compte dans l’application, confirmer son e-mail, puis revenir se connecter sur la vitrine. La session est conservée en mémoire seulement (`persistSession: false`). La demande est enregistrée dans `directory_claims`, en attente, avec e-mail du compte confirmé, fonction, éléments de vérification et téléphone facultatif. Une demande en attente est idempotente par utilisateur/SIRET ; maximum 5 nouvelles demandes sur 24 heures. Les demandes ne sont lisibles que par le demandeur et les administrateurs autorisés.

La validation se fait côté serveur par `review_directory_claim`, réservée aux administrateurs. Une acceptation exige un commerce **déjà existant**, appartenant au demandeur, avec le même SIRET, et une justification de contrôle ; elle est journalisée. Aucune création de compte professionnel, de mini-site ou d’abonnement facturé n’est déclenchée par une revendication. Les migrations et le test de sécurité sont dans le dépôt `ZEROO` (`public_pro_directory`, `directory_verified_minisite_links`, `public_directory.test.sql`).

### Réimport reproductible

```bash
python3 scripts/prepare_directory_import.py /chemin/annuaire_yvelines_etablissements.csv --output-dir /tmp/zeeroo-directory-import
```

Appliquer les lots SQL dans l’ordre dans le projet Supabase `rgxesocsvhgsqoehxhgt`. Les lots font un upsert par SIRET, sans réactiver une référence dépubliée ni effacer un rattachement. Le CSV original n’est pas publié dans le site.

### Vérification

`npm ci --ignore-scripts && npm test` : tests de la liste, de la pagination/recherche, des liens conditionnels, de l’échappement des contenus, du formulaire et du filtrage CSV. Ils s’exécutent avant le déploiement Pages. `scripts/`, `tests/`, les dépendances et les manifestes npm ne sont pas copiés dans l’artefact public. Le parcours visuel a été vérifié à 320, 390 et 1 280 px avec les recherches publiques réelles ; la soumission de formulaire a été simulée en navigateur et vérifiée séparément en base dans une transaction annulée.
