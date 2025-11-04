import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function Contact() {
  return (
    <>
      <Header />
      <main className="flex flex-col justify-center items-center min-h-[calc(100vh-200px)] mb-8">
        <h2 className="font-['Lobster'] text-center text-2xl md:text-4xl my-8">Nous contacter</h2>
        <div className="max-w-[30rem] h-auto min-h-[150px] bg-skill-tertiary flex items-center justify-center p-4 text-center rounded-lg border border-skill-success/50 mb-8">
          <p className="text-justify px-4 max-w-[95vw]">
            <strong>SkillFusion</strong> met un point d'honneur à satisfaire ses apprenants en leurs fournissant des cours de qualité et vérifiés. Pour toutes remarques, questions, suggestions, nous serons ravis de vous répondre.
          </p>
        </div>
        <div className="w-full flex justify-center mb-8">
          <div className="m-8">
            <h3 className="font-['Lobster'] text-xl md:text-2xl mb-4">Nos coordonnées :</h3>
            <p className="my-4">Téléphone : 06.05.99.24.64</p>
            <p className="my-4">Mail : <a href="mailto:skillfusion@gmail.com" className="text-blue-600 hover:text-skill-accent no-underline">skillfusion@gmail.com</a></p>
            <p className="my-4">Courrier : 10 rue de Penthièvre, Paris (75008)</p>
            <p className="my-4">Sur les réseaux sociaux : ****, ****</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}