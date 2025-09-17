import { useState } from "react";

export default function MobileNavbar({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Bouton menu burger visible uniquement en mobile */}
      {!isOpen && (
        <div className="burger-button" onClick={() => setIsOpen(true)}>
          <div className="burger-menu">
            <span className="burger-menu__line"></span>
            <span className="burger-menu__line"></span>
            <span className="burger-menu__line"></span>
          </div>
        </div>
      )}

      {/* Navbar mobile affichée seulement si isOpen est true */}
      <div className={`mobile__navbar ${isOpen ? "open" : ""}`}>
        <button className="close-button" onClick={closeMenu}> X </button>
        <ul>
          <li>
            <a className="normal-link" href="/" onClick={closeMenu}>
              Accueil
            </a>
          </li>
          <li>
            <a className="normal-link" href="/lessons" onClick={closeMenu}>
              Catalogue
            </a>
          </li>
          <li>
            <a className="normal-link" href="/categories" onClick={closeMenu}>
              Catégories
            </a>
          </li>
          <li>
            <a className="normal-link" href="/contact" onClick={closeMenu}>
              Contact
            </a>
          </li>

          {user ? (
            <>
              <li>
                <a className="normal-link" href="/forum" onClick={closeMenu}>
                  Forum
                </a>
              </li>
              <li>
                <a className="normal-link" href="/board" onClick={closeMenu}>
                  Tableau de bord
                </a>
              </li>
              <li>
                <button 
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="normal-link normal-button"
                >
                  Déconnexion
                </button>
              </li>
              <li>
                <span>{user.pseudo}</span>
              </li>
            </>
          ) : (
            <li>
              <a className="normal-link" href="/login" onClick={closeMenu}>
                Connexion
              </a>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
