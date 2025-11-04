import { useState } from "react";
import ConfirmDeleteModal from "../pages/ConfirmDeleteModal";

export default function MobileNavbar({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    closeMenu();
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Logo, SkillFusion et bouton menu burger - visible uniquement en mobile */}
      {!isOpen && (
        <div className="md:hidden flex justify-between items-center w-full p-4">
          {/* Logo et titre à gauche */}
          <div className="flex flex-row items-center gap-2 z-[50]">
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
                onError={() => {
                  console.error("❌ Erreur de chargement du logo");
                }}
              />
            </a>
            <h1 className="font-display text-2xl text-skill-text-primary">SkillFusion</h1>
          </div>
          
          {/* Bouton menu burger à droite */}
          <div 
            className="cursor-pointer" 
            onClick={() => setIsOpen(true)}
          >
            <div className="flex flex-col justify-between h-[25px] w-[30px] z-[100]">
              <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
              <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
              <span className="block w-[35px] h-1 bg-skill-secondary border border-black shadow-[1px_1px_rgb(182,181,181)]"></span>
            </div>
          </div>
        </div>
      )}

      {/* Navbar mobile affichée seulement si isOpen est true */}
      <div className={`absolute right-0 w-[13rem] flex-col items-end bg-skill-secondary z-[2] md:hidden ${isOpen ? "flex" : "hidden"}`}>
        <button 
          className="w-6 m-1.5 text-white bg-transparent border-none cursor-pointer hover:text-skill-accent" 
          onClick={closeMenu}
        >
          X
        </button>
        <ul className="flex flex-col justify-between items-center p-4">
          <li className="mt-3">
            <a 
              className="no-underline text-white hover:text-skill-accent" 
              href="/" 
              onClick={closeMenu}
            >
              Accueil
            </a>
          </li>
          <li className="mt-3">
            <a 
              className="no-underline text-white hover:text-skill-accent" 
              href="/lessons" 
              onClick={closeMenu}
            >
              Catalogue
            </a>
          </li>
          <li className="mt-3">
            <a 
              className="no-underline text-white hover:text-skill-accent" 
              href="/categories" 
              onClick={closeMenu}
            >
              Catégories
            </a>
          </li>
          <li className="mt-3">
            <a 
              className="no-underline text-white hover:text-skill-accent" 
              href="/contact" 
              onClick={closeMenu}
            >
              Contact
            </a>
          </li>

          {user ? (
            <>
              <li className="mt-3">
                <a 
                  className="no-underline text-white hover:text-skill-accent" 
                  href="/forum" 
                  onClick={closeMenu}
                >
                  Forum
                </a>
              </li>
              <li className="mt-3">
                <a 
                  className="no-underline text-white hover:text-skill-accent" 
                  href="/board" 
                  onClick={closeMenu}
                >
                  Tableau de bord
                </a>
              </li>
              <li className="mt-3">
                <button 
                  onClick={handleLogoutClick}
                  className="no-underline text-white bg-transparent border-none p-0 cursor-pointer font-inherit outline-none hover:text-skill-accent"
                >
                  Déconnexion
                </button>
              </li>
                     <li className="mt-3">
                       <span>{user.user_name?.replace(/^./, (match) => match.toUpperCase()) || user.user_name}</span>
                     </li>
            </>
          ) : (
            <li className="mt-3">
              <a 
                className="no-underline text-white hover:text-skill-accent" 
                href="/login" 
                onClick={closeMenu}
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
    </>
  );
}
