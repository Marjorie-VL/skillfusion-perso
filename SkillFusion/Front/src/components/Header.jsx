import React, { useState } from "react";
import { useAuth } from "../services/api.jsx";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <header className="w-full relative">
        <div className="w-full bg-skill-primary border-b border-skill-secondary py-4 md:py-6 flex items-center justify-center min-h-[100px]">
          <div className="text-center text-skill-text-primary font-display text-lg">Chargement...</div>
        </div>
      </header>
    );
  }

  return (
    <header className="w-full relative">
      {/* Bande unifiée Header/Navbar */}
      <div 
        className="w-full bg-skill-primary border-b border-skill-secondary py-4 md:py-6 flex flex-row items-end justify-between px-4 md:px-12 relative"
        style={{
          backgroundImage: "url('/Images/webpc-passthru.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay pour améliorer la lisibilité */}
        <div className="absolute inset-0 bg-skill-primary/70 -z-0"></div>

        {/* Logo et SkillFusion à gauche */}
        <div className="flex flex-row items-center gap-2 md:gap-4 relative z-10">
          <a href="/" className="flex items-center">
            <img 
              src="/Images/logo.png"
              alt="Logo SkillFusion" 
              style={{ 
                display: 'block',
                height: '4rem',
                width: 'auto',
                maxWidth: '150px',
                objectFit: 'contain'
              }}
              className="md:h-20 md:max-w-[200px]"
              onError={() => {
                console.error("❌ Erreur de chargement du logo");
              }}
            />
          </a>
          <h1 className="font-display text-2xl md:text-4xl text-skill-text-primary">SkillFusion</h1>
        </div>

        {/* Menu de navigation et utilisateur - Desktop seulement */}
        <div className="hidden md:flex flex-1 justify-center relative z-10">
          <div className="flex flex-row justify-center items-center gap-2 md:gap-4 bg-white/40 backdrop-blur-sm px-4 py-2 rounded-lg border border-skill-secondary/50 shadow-md">
            <ul className="flex flex-row justify-center items-center gap-2 md:gap-4">
              <li><a className="no-underline text-skill-text-primary px-3 py-1 rounded-lg transition-colors hover:bg-skill-secondary hover:text-white font-display text-lg md:text-xl" href="/">Accueil</a></li>
              <li><a className="no-underline text-skill-text-primary px-3 py-1 rounded-lg transition-colors hover:bg-skill-secondary hover:text-white font-display text-lg md:text-xl" href="/lessons">Catalogue</a></li>
              <li><a className="no-underline text-skill-text-primary px-3 py-1 rounded-lg transition-colors hover:bg-skill-secondary hover:text-white font-display text-lg md:text-xl" href="/categories">Catégories</a></li>
              {user && (
                <>
                  <li><a className="no-underline text-skill-text-primary px-3 py-1 rounded-lg transition-colors hover:bg-skill-secondary hover:text-white font-display text-lg md:text-xl" href="/forum">Forum</a></li>
                  <li><a className="no-underline text-skill-text-primary px-3 py-1 rounded-lg transition-colors hover:bg-skill-secondary hover:text-white font-display text-lg md:text-xl" href="/board">Tableau de bord</a></li>
                </>
              )}
            </ul>
            
            {/* Nom d'utilisateur et déconnexion */}
            {user ? (
              <div className="flex flex-row items-center gap-3 ml-12 md:ml-16 pl-12 md:pl-16 border-l border-skill-secondary/30">
                <span className="text-lg md:text-xl text-skill-text-primary font-display">{user.user_name.replace(/^./, (match) => match.toUpperCase())}</span>
                <button 
                  onClick={handleLogoutClick} 
                  className="text-lg md:text-xl bg-skill-secondary text-white border border-skill-secondary px-3 py-1 rounded-lg cursor-pointer hover:bg-skill-accent hover:border-skill-accent transition-colors whitespace-nowrap font-display"
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <div className="ml-12 md:ml-16 pl-12 md:pl-16 border-l border-skill-secondary/30">
                <a className="no-underline text-skill-text-primary hover:text-skill-accent whitespace-nowrap font-display text-lg md:text-xl" href="/login">Connexion</a>
              </div>
            )}
          </div>
        </div>

        {/* Bouton menu burger - Mobile seulement */}
        <div 
          className="md:hidden cursor-pointer relative z-10" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <div className="flex flex-col justify-between h-[25px] w-[30px]">
            <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
            <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
            <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
          </div>
        </div>
      </div>

      {/* Overlay pour fermer le menu en cliquant à l'extérieur */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[90] md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Menu mobile latéral */}
      <div className={`fixed top-0 right-0 h-full w-[280px] sm:w-[320px] flex-col items-start bg-skill-secondary z-[100] md:hidden shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? "flex translate-x-0" : "hidden translate-x-full"}`}>
        <div className="flex justify-between items-center w-full p-4 border-b border-white/20">
          <h2 className="text-white font-display text-xl font-semibold">Menu</h2>
          <button 
            className="w-8 h-8 flex items-center justify-center text-white bg-transparent border-none cursor-pointer hover:text-skill-accent hover:bg-white/10 rounded transition-colors text-xl font-bold" 
            onClick={closeMobileMenu}
            aria-label="Fermer le menu"
          >
            ×
          </button>
        </div>
        <ul className="flex flex-col w-full p-4 overflow-y-auto">
          <li className="mb-3">
            <a 
              className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
              href="/" 
              onClick={closeMobileMenu}
            >
              Accueil
            </a>
          </li>
          <li className="mb-3">
            <a 
              className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
              href="/lessons" 
              onClick={closeMobileMenu}
            >
              Catalogue
            </a>
          </li>
          <li className="mb-3">
            <a 
              className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
              href="/categories" 
              onClick={closeMobileMenu}
            >
              Catégories
            </a>
          </li>
          {user ? (
            <>
              <li className="mb-3">
                <a 
                  className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
                  href="/forum" 
                  onClick={closeMobileMenu}
                >
                  Forum
                </a>
              </li>
              <li className="mb-3">
                <a 
                  className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
                  href="/board" 
                  onClick={closeMobileMenu}
                >
                  Tableau de bord
                </a>
              </li>
              <li className="mb-3 border-t border-white/20 pt-3 mt-2">
                <span className="block text-white font-display text-base py-2 px-4 text-skill-accent font-semibold">
                  {user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name}
                </span>
              </li>
              <li className="mb-3">
                <button 
                  onClick={handleLogoutClick}
                  className="w-full text-left no-underline text-white bg-transparent border-none p-0 cursor-pointer font-display outline-none hover:text-skill-accent hover:bg-white/10 text-lg py-3 px-4 rounded transition-colors"
                >
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <li className="mb-3">
              <a 
                className="block no-underline text-white hover:text-skill-accent hover:bg-white/10 font-display text-lg py-3 px-4 rounded transition-colors" 
                href="/login" 
                onClick={closeMobileMenu}
              >
                Connexion
              </a>
            </li>
          )}
        </ul>
      </div>

      {/* Modale de confirmation déconnexion */}
      <ConfirmDeleteModal
        show={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Déconnexion"
        message="Êtes-vous sûr(e) de vouloir vous déconnecter ?"
        confirmText="Déconnexion"
        cancelText="Annuler"
      />
    </header>
  );
}
