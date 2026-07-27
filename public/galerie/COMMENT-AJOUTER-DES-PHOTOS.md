# 📸 Comment intégrer vos photos

Le site est organisé pour que vous n'ayez **qu'à déposer vos images** dans le
bon dossier, avec le bon nom. Aucune modification de code n'est nécessaire :
dès qu'un fichier existe, il remplace automatiquement l'emplacement
« Photo à venir ».

## 🗂️ Structure des dossiers

```
public/galerie/
├── hero.jpg                 ← Photo de fond de l'en-tête (COMMUNE à TOUTES les pages)
├── accueil/                 ← Galerie de la page d'accueil
├── photographie/            ← Galerie « Photographie »
├── impression-numerique/    ← Galerie « Impression numérique »
├── infographie/             ← Galerie « Infographie »
├── a-propos/                ← (vide — en-tête commun)
└── contact/                 ← (vide — en-tête commun)
```

> 🖼️ **Photo d'en-tête** : `public/galerie/hero.jpg` sert de fond à l'en-tête
> de **toutes** les pages internes (photographie, contact, etc.).
>
> 🎞️ **Diaporama de l'accueil** : la page d'accueil fait défiler jusqu'à
> **3 images** avec un fondu enchaîné + zoom lent. Déposez :
>
> - `public/galerie/hero.jpg` (déjà en place)
> - `public/galerie/hero-2.jpg` (optionnel)
> - `public/galerie/hero-3.jpg` (optionnel)
>
> Le défilement s'active automatiquement dès qu'au moins **2** de ces fichiers
> existent. Avec une seule image, l'accueil reste fixe (comme les autres pages).

Chaque dossier contient un fichier **`_A-LIRE.md`** qui liste les noms de
fichiers exacts à utiliser pour ce dossier.

## ✅ Règles simples

1. **Respectez le nom exact** indiqué dans le `_A-LIRE.md` du dossier
   (ex : `mariage.jpg`, `hero.jpg`).
2. **Format `.jpg`** (ou `.webp`), sans accents ni espaces dans le nom.
3. **En-têtes (`hero.jpg`)** : photo horizontale, large (~1920 px).
4. **Galeries** : ~1200 px de large suffisent.

## 🖼️ Logo & favicon

- Logo (en-tête, pied de page, onglet du navigateur) : `public/icone.png`

## 🙋 Besoin d'un autre nom ou d'une autre disposition ?

Dites-le moi et j'adapte le code (formats `.png`, ordre des photos, nombre
d'images par galerie, etc.).
