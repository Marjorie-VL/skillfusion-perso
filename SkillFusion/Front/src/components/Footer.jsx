import React from "react";
import { Link } from "react-router-dom";

const footer = () => (
  <footer className="w-full flex justify-center items-center gap-8 py-4 bg-skill-primary px-4 box-border mt-auto">
    <span className="text-skill-text-primary">
      © 2025 Skill Fusion. Tous droits réservés.
    </span>
    <span className="flex items-center">
      <a href="/mentions-legales" className="no-underline text-skill-text-primary hover:text-skill-accent">Mentions légales</a>
      <span className="mx-2 text-skill-text-primary">|</span>
      <a href="/faq" className="no-underline text-skill-text-primary hover:text-skill-accent">FAQ</a>
      <span className="mx-2 text-skill-text-primary">|</span>
      <a href="/contact" className="no-underline text-skill-text-primary hover:text-skill-accent">Contact</a>
    </span>
  </footer>
);
export default footer;
