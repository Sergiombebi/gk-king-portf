# 🔐 Espace administration — mise en service

L'espace admin permet d'**ajouter et supprimer les photos** du site depuis un
navigateur, sans toucher au code : `https://votre-site.com/admin`.

Il n'utilise **aucune base de données**. Les photos sont rangées dans le
stockage de fichiers Vercel Blob, et les identifiants dans un fichier privé de
ce même stockage.

---

## 1. Créer le stockage des photos (une seule fois)

Dans le tableau de bord Vercel :

1. Ouvrez votre projet → onglet **Storage**
2. **Create Database** → choisissez **Blob** → validez
3. **Connect Project** → sélectionnez ce projet

Vercel ajoute alors tout seul les variables nécessaires. Deux cas possibles
selon l'âge de votre compte, et le site s'adapte automatiquement aux deux :

| Variable ajoutée | Mode d'envoi des photos | Taille max |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | Le navigateur écrit directement dans le stockage | 8 Mo |
| `BLOB_STORE_ID` (mode OIDC) | La photo passe par le site | 4 Mo |

Le second mode est celui des connexions récentes. Il fonctionne parfaitement,
mais la plateforme limite la taille des requêtes reçues par le site, d'où le
plafond plus bas. Pour repasser en envoi direct, ajoutez manuellement un
`BLOB_READ_WRITE_TOKEN` (onglet **Paramètres** du magasin, section des jetons)
puis redéployez.

Le tableau de bord indique toujours quel mode est actif.

## 2. Définir les identifiants (une seule fois)

Toujours dans Vercel : projet → **Settings** → **Environment Variables**.
Ajoutez ces trois variables, pour les environnements *Production*, *Preview* et
*Development* :

| Variable | Valeur |
|---|---|
| `SESSION_SECRET` | une longue chaîne aléatoire (32 caractères ou plus) |
| `ADMIN_USERNAME` | l'identifiant de connexion souhaité |
| `ADMIN_PASSWORD` | le mot de passe de départ (8 caractères minimum) |

Pour générer le secret, dans un terminal :

```bash
openssl rand -base64 32
```

Redéployez le site pour que les variables soient prises en compte.

## 3. Se connecter

Rendez-vous sur `/admin`. La page de connexion s'affiche, puis le tableau de
bord une fois les identifiants saisis. La session dure 7 jours.

> **Changer de mot de passe** : c'est prévu en bas du tableau de bord. Le
> nouveau mot de passe est enregistré (sous forme d'empreinte irréversible)
> dans le stockage et remplace celui des variables d'environnement.
>
> ⚠️ Il n'y a pas de « mot de passe oublié » par e-mail. En cas d'oubli,
> supprimez le fichier `admin/credentials.json` depuis l'onglet Storage de
> Vercel : les identifiants des variables d'environnement redeviennent alors
> valables.

---

## Comment ça marche

- **Cinq sections** sont gérables : la photo d'en-tête, le portfolio de
  l'accueil, et les galeries des trois prestations.
- **Repli automatique** : tant qu'aucune photo n'a été envoyée pour une
  section, le site continue d'afficher les images livrées dans
  `public/galerie/`. Dès la première photo envoyée, celles-ci prennent le
  relais.
- **Envoi direct** : le navigateur envoie la photo directement au stockage,
  sans passer par le serveur. Les gros fichiers passent donc sans problème
  (limite fixée à 8 Mo par photo, formats JPG, PNG, WEBP et AVIF).
- **Mise à jour du site** : après chaque ajout ou suppression, les pages
  publiques sont régénérées automatiquement.
- **Titre des photos** : le champ « Titre » sert à nommer le fichier et le
  texte alternatif (utile pour l'accessibilité et le référencement). S'il est
  laissé vide, le nom du fichier d'origine est utilisé.

## Tester en local

Créez un fichier `.env.local` à la racine (voir `.env.example`) avec au minimum
`SESSION_SECRET`, `ADMIN_USERNAME` et `ADMIN_PASSWORD`. Sans
`BLOB_READ_WRITE_TOKEN`, l'interface s'affiche et la connexion fonctionne, mais
les envois échouent : c'est normal, le stockage n'existe qu'une fois créé sur
Vercel.

```bash
npm run dev
```
