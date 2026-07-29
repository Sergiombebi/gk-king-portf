# 📸 Comment intégrer vos photos

Il y a désormais **deux façons** d'ajouter des photos au site.

## 1. Depuis l'espace administration (recommandé)

Rendez-vous sur `/admin`, connectez-vous, puis glissez-déposez vos photos dans
la section voulue. Aucun accès au code n'est nécessaire, et le site se met à
jour tout seul.

👉 Mise en service et fonctionnement détaillé : voir **`ADMIN.md`** à la racine
du projet.

Sections gérables depuis l'admin :

| Section | Où elle apparaît sur le site |
|---|---|
| Photo d'en-tête | Grande photo de fond, en haut de **toutes** les pages |
| Portfolio (accueil) | Section « Un aperçu de mon univers » |
| Photographie | Galerie de la page Photographie |
| Impression numérique | Galerie de la page Impression numérique |
| Infographie | Galerie de la page Infographie |

## 2. En déposant les fichiers dans ce dossier (méthode d'origine)

Ces images servent de **repli** : elles s'affichent tant qu'aucune photo n'a
été envoyée depuis l'admin pour la section concernée. Dès qu'une photo est
ajoutée via l'admin, elles sont remplacées.

```
public/galerie/
├── hero.jpg                 ← Photo de fond de l'en-tête (COMMUNE à TOUTES les pages)
├── accueil/                 ← Portfolio de la page d'accueil
├── photographie/            ← Galerie « Photographie »
├── impression-numerique/    ← Galerie « Impression numérique »
├── infographie/             ← Galerie « Infographie »
├── a-propos/                ← Portrait affiché dans la section « À propos »
└── contact/                 ← (vide — en-tête commun)
```

Chaque dossier contient un fichier **`_A-LIRE.md`** qui liste les noms de
fichiers exacts à utiliser.

## ✅ Règles simples

1. **Format `.jpg`, `.png`, `.webp` ou `.avif`**, sans accents ni espaces dans
   le nom de fichier.
2. **En-tête** : photo horizontale, large (~1920 px).
3. **Galeries** : ~1200 px de large suffisent.
4. **Taille** : 8 Mo maximum par photo lors d'un envoi depuis l'admin.

## 🖼️ Logo & favicon

- Logo (en-tête, pied de page, onglet du navigateur) : `public/icone.png`
