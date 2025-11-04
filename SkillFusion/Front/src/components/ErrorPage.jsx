import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function ErrorPage({code = 404, message = "Page introuvable"}) {

  console.log(Error) 
  return (
      <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4 min-h-[60vh]">
        <div className="text-center p-8">
          <h2 className="font-display text-center text-4xl md:text-6xl mb-4 text-red-600">{code} - {message}</h2>
          <p className="text-gray-600 text-lg mb-4">La page que vous recherchez n'existe pas ou a été déplacée.</p>
          <a href="/" className="font-display text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors inline-block no-underline">
            Retour à l'accueil
          </a>
        </div>
       </main>
       <Footer />
       </>
    );
  }
