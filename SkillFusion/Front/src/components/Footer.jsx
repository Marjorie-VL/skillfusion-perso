import React from "react";
import { Link } from "react-router-dom";

const footer = () => (
  <footer className="footer" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "2rem", padding: "1rem 0" }}>
    <span>
      © 2025 Skill Fusion. Tous droits réservés.
    </span>
    <span>
      <a href="/mentions-legales" className="normal-link">Mentions légales</a>
      <span style={{ margin: "0 0.5rem" }}>|</span>
      <a href="/faq" className="normal-link">FAQ</a>
    </span>
  </footer>
);
export default footer;
