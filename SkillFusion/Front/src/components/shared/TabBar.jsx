import React from "react";

/**
 * Composant réutilisable pour la barre d'onglets
 * @param {Array} tabs - Tableau d'objets {id, label}
 * @param {string} activeTab - ID de l'onglet actif
 * @param {function} onTabChange - Callback appelé quand un onglet est cliqué
 */
export default function TabBar({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-skill-secondary/30">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`font-display text-lg md:text-xl py-3 px-6 rounded-t-lg transition-colors ${
            activeTab === tab.id
              ? "bg-skill-secondary text-white border-b-2 border-skill-secondary"
              : "bg-skill-primary/20 text-skill-text-primary hover:bg-skill-primary/30"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

