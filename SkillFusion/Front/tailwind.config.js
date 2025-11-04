/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'md': '1100px', // Breakpoint desktop correspondant au CSS original
      },
      fontFamily: {
        'display': ['Merriweather', 'serif'], // Pour les titres et éléments importants
        'body': ['Inter', 'sans-serif'], // Pour le corps de texte
        'sans': ['Inter', 'sans-serif'], // Police par défaut
      },
      colors: {
        // Palette principale SkillFusion - Terroir & Artisanat (Option 3)
        'skill': {
          // Couleurs principales - Terroir & Artisanat
          'primary': '#D4A574',    // Beige bois (Primary - Header/Footer, backgrounds principaux)
          'secondary': '#8B7355',  // Brun outil (Secondary - Navbar, bordures, accents forts)
          'tertiary': '#A8D5BA',   // Vert nature (Tertiary - Cards, sections douces)
          'accent': '#E8B86D',     // Doré chaud (Accent - Hover, highlights, CTA)
          
          // Couleurs d'accentuation (adaptées au thème terroir)
          'success': '#4A7C59',   // Vert forêt (Succès, validations, statut publié)
          'warning': '#D97642',    // Orange terre cuite (Avertissements, badges nouveau)
          'danger': '#C94A47',    // Rouge brique (Erreurs, suppressions, actions critiques)
          
          // Neutres pour le texte
          'text': {
            'primary': '#2C2C2C',   // Texte principal (presque noir)
            'secondary': '#6B7280', // Texte secondaire (gris moyen)
            'light': '#9CA3AF',     // Texte clair (gris clair)
          },
          
          // Backgrounds
          'bg': {
            'white': '#FFFFFF',     // Blanc pur
            'light': '#F9FAFB',     // Gris très clair
          },
          
          // Bordures
          'border': '#E5E7EB',      // Gris clair pour bordures
          
          // Rétrocompatibilité avec l'ancienne palette (si nécessaire)
          'blue': '#BAD2E1',        // Ancien bleu ciel
          'gold': '#C9A65E',        // Ancien beige doré
          'sand': '#DBEBC6',        // Ancien beige sable
        },
      },
    },
  },
  plugins: [],
  important: true,
}

