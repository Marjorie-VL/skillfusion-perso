import React from "react";
import Header from "./Header";
import Footer from "./Footer";

export default function ErrorMaintenance({code = 503, message = "Page Maintenance"}) {

  console.log(Error) 
  return (
      <>
      <Header />
      <main className="flex flex-col justify-between items-center mb-4 min-h-[60vh]">
        <div className="text-center p-8">
          <h2 className="font-['Lobster'] text-center text-4xl md:text-6xl mb-4 text-orange-600">{code} - {message}</h2>
          <p className="text-gray-600 text-lg mb-4">Le site est actuellement en maintenance. Veuillez revenir plus tard.</p>
          <a href="/" className="font-['Lobster'] text-xl md:text-2xl py-2 px-4 bg-skill-secondary text-white rounded hover:bg-skill-accent transition-colors inline-block no-underline">
            Retour à l'accueil
          </a>
        </div>
       </main>
       <Footer />
       </>
    );
  }