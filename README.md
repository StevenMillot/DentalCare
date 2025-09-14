# DentalCare - Site Vitrine

Un site vitrine moderne et dynamique pour un cabinet dentaire, inspiré de la structure du site CTC Vienne mais avec un design original et des animations avancées.

## 🚀 Fonctionnalités

### Design & Interface
- **Design moderne** avec dégradés et effets visuels avancés
- **Interface responsive** adaptée à tous les appareils
- **Animations fluides** et interactions dynamiques
- **Navigation sticky** avec effets de transparence
- **Cartes flottantes** avec animations parallaxes

### Sections du Site
1. **Accueil** - Hero section avec titre animé et cartes flottantes
2. **Services** - Présentation des soins dentaires avec icônes animées
3. **Équipe** - Profils des professionnels avec liens sociaux
4. **Technologies** - Équipements modernes du cabinet
5. **Contact** - Formulaire de rendez-vous et informations de contact

### Interactivité
- **Menu mobile** hamburger avec animations
- **Formulaire de contact** avec validation et notifications
- **Smooth scroll** pour la navigation
- **Animations au scroll** avec Intersection Observer
- **Effets de hover** sur tous les éléments interactifs
- **Particules animées** en arrière-plan

## 🛠️ Technologies Utilisées

- **HTML5** - Structure sémantique
- **CSS3** - Styles modernes avec variables CSS et animations
- **JavaScript ES6+** - Interactivité et animations
- **Font Awesome** - Icônes vectorielles
- **Google Fonts** - Typographie Inter

## 📁 Structure du Projet

```
DentalCare/
├── index.html          # Page principale
├── styles.css          # Styles et animations CSS
├── script.js           # JavaScript et interactions
└── README.md           # Documentation
```

## 🎨 Palette de Couleurs

- **Couleur primaire** : `#00d4aa` (Vert-cyan)
- **Couleur secondaire** : `#667eea` (Bleu)
- **Couleur d'accent** : `#f093fb` (Rose)
- **Texte sombre** : `#2d3748`
- **Texte clair** : `#718096`

## 🚀 Installation et Utilisation

1. **Cloner le projet** :
   ```bash
   git clone [url-du-repo]
   cd DentalCare
   ```

2. **Ouvrir le site** :
   - Double-cliquer sur `index.html`
   - Ou utiliser un serveur local :
     ```bash
     python -m http.server 8000
     # Puis ouvrir http://localhost:8000
     ```

## 📱 Responsive Design

Le site est entièrement responsive avec des breakpoints :
- **Desktop** : > 768px
- **Tablet** : 768px - 480px
- **Mobile** : < 480px

## ✨ Animations Principales

### CSS Animations
- **Float** : Animation des cartes flottantes
- **FadeInUp** : Apparition des éléments au scroll
- **Bounce** : Indicateur de scroll
- **Ripple** : Effet de clic sur les boutons

### JavaScript Animations
- **Typewriter** : Effet de machine à écrire sur le titre
- **Parallaxe** : Effet de profondeur au scroll
- **Particules** : Animation d'arrière-plan
- **Notifications** : Système de messages dynamiques

## 🔧 Personnalisation

### Modifier les couleurs
Éditer les variables CSS dans `styles.css` :
```css
:root {
    --primary-color: #00d4aa;
    --secondary-color: #667eea;
    --accent-color: #f093fb;
    /* ... */
}
```

### Ajouter des sections
1. Ajouter la structure HTML dans `index.html`
2. Créer les styles correspondants dans `styles.css`
3. Ajouter les animations JavaScript si nécessaire

### Modifier le contenu
- **Informations de contact** : Ligne 250-280 dans `index.html`
- **Services** : Section services dans `index.html`
- **Équipe** : Section équipe dans `index.html`

## 🌟 Fonctionnalités Avancées

### Système de Notifications
- Notifications de succès pour le formulaire
- Animations d'entrée et de sortie
- Fermeture automatique et manuelle

### Validation de Formulaire
- Validation en temps réel
- Indicateurs visuels d'erreur
- Prévention d'envoi de formulaires vides

### Performance
- **Lazy loading** des animations
- **Intersection Observer** pour les animations au scroll
- **Optimisation** des transitions CSS

## 📞 Support

Pour toute question ou modification :
- Modifier directement les fichiers HTML/CSS/JS
- Tester sur différents navigateurs
- Vérifier la responsivité sur mobile

## 📄 Licence

Ce projet est libre d'utilisation pour des projets personnels et commerciaux.

---

**DentalCare** - Votre sourire, notre passion ✨
