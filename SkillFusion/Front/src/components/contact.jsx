import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Contact() {
  return (
    <>
      <Header />
      <main>
        <h2>Nous contacter</h2>
        <div className="presentation">
          <p>
            <strong>SkillFusion</strong> met un point d'honneur à satisfaire ses apprenants en leurs fournissant des cours de qualité et vérifiés. Pour toutes remarques, questions, suggestions, nous serons ravis de vous répondre.
          </p>
        </div>
        <div className="contact-section">
          <div className="contact-list">
            <h3>Nos coordonnées :</h3>
            <p>Téléphone : 00 00 00 00 00</p>
            <p>Mail : lorem@ipsum.fr</p>
            <p>Courrier : 10 rue de Penthièvre, Paris (75008)</p>
            <p>Sur les réseaux sociaux : ****, ****</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}