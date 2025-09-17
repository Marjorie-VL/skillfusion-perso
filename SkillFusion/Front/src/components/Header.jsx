import React from "react";
import logo from "/Images/logo.png";
import { useAuth } from "../services/api.jsx";
import NavBar from "./Navbar.jsx";

export default function Header() {

  const { user, loading, logout } = useAuth(); // Récupération des données utilisateur

  if (loading) {
    return <div>Chargement...</div>; // Afficher un loader si on attend la réponse
  }
  return (
  <header className="header">
    <div className="first-title__banner">
      <a href="/">
      <img src={logo} alt="Logo" className="title__logo" />

      <h1 className="header-title normal-link">Skill Fusion</h1>
      </a>
      {/* Mobile Navigation Bar */}

      <NavBar user={user} logout={logout}/>
      </div>

    <div className="second-title__banner">
      <h1 className="header-title">Skill Fusion</h1>
    </div>

    {/* Desktop Navigation Bar */}
    <div className="desktop__navbar">
      <ul>
        <li><a className="normal-link" href="/">Accueil</a></li>
        <li><a className="normal-link" href="/lessons">Catalogue</a></li>
        <li><a className="normal-link" href="/categories">Catégories</a></li>
        <li><a className="normal-link" href="/contact">Contact</a></li>
       
    {/* Afficher le nom de l'utilisateur ou le lien de connexion */}
    {user ? (
      <>
        <li><a className="normal-link" href="/forum">Forum</a></li>
        <li><a className="normal-link" href="/board">Tableau de bord</a></li>
        <li><button onClick={logout} className="normal-button">Déconnexion</button></li>
        <li><span><strong>{user.pseudo.replace(/^./, (match) => match.toUpperCase())}</strong></span></li>
      </>
    ) : (
        <li><a className="normal-link" href="/login">Connexion</a></li> // Sinon, afficher le lien de connexion
    )}

      </ul>
    </div>
  </header>
);
}