import React from 'react';

/**
 * Composant pour afficher les images avec gestion automatique des URLs
 * @param {string} src - URL de l'image (peut être relative ou absolue)
 * @param {string} alt - Texte alternatif
 * @param {string} className - Classes CSS
 * @param {object} style - Styles inline
 * @param {object} props - Autres props à passer à l'img
 */
export default function ImageDisplay({ src, alt, className, style, ...props }) {
  // Si pas d'URL, ne rien afficher
  if (!src) {
    return null;
  }

  // Construire l'URL complète
  const getImageUrl = (imageSrc) => {
    // Si c'est déjà une URL complète (http/https), l'utiliser telle quelle
    if (imageSrc.startsWith('http')) {
      return imageSrc;
    }
    
    // Si c'est une URL relative, ajouter l'URL de l'API
    return `${import.meta.env.VITE_API_URL}${imageSrc}`;
  };

  return (
    <img
      src={getImageUrl(src)}
      alt={alt || 'Image'}
      className={className}
      style={style}
      onError={(e) => {
        console.warn('Erreur de chargement de l\'image:', src);
        e.target.style.display = 'none';
      }}
      {...props}
    />
  );
}
